"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { RegistrarProva } from "@aplicacao/RegistrarProva";
import { AssinarProva } from "@aplicacao/AssinarProva";
import { ProvaRepositorioSupabase } from "@infra/supabase/ProvaRepositorioSupabase";
import { criarClienteServidor, criarClienteSSR } from "@infra/supabase/cliente";

type Resultado = { ok: true } | { ok: false; erro: string };

function repositorio() {
  return new ProvaRepositorioSupabase(criarClienteServidor());
}

const schemaRegistrar = z.object({
  tipo: z.enum(["campanha", "consultoria", "festival", "negociacao", "outro"]),
  titulo: z.string().min(1, "Titulo obrigatorio."),
  descricao: z.string().min(1, "Descricao obrigatoria."),
  resultado: z.string().optional(),
  ladoRegistrante: z.enum(["criador", "contratante"]),
  outraParteId: z.string().min(1, "Informe o ID da outra parte."),
});

export async function registrarProva(formData: FormData): Promise<Resultado> {
  // Identidade sempre da SESSAO, nunca do FormData.
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sessao expirada. Entre novamente." };

  const parsed = schemaRegistrar.safeParse({
    tipo: formData.get("tipo"),
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao"),
    resultado: formData.get("resultado") || undefined,
    ladoRegistrante: formData.get("ladoRegistrante"),
    outraParteId: formData.get("outraParteId"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.errors[0].message };
  }

  const d = parsed.data;
  const ehCriador = d.ladoRegistrante === "criador";
  try {
    await new RegistrarProva(repositorio()).executar({
      id: crypto.randomUUID(),
      tipo: d.tipo,
      titulo: d.titulo,
      descricao: d.descricao,
      resultado: d.resultado,
      criadorId: ehCriador ? user.id : d.outraParteId,
      contratanteId: ehCriador ? d.outraParteId : user.id,
      registranteId: user.id,
      ladoRegistrante: d.ladoRegistrante,
    });
    revalidatePath("/provas");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido.";
    return { ok: false, erro: msg };
  }
}

const schemaAssinar = z.object({ provaId: z.string().min(1) });

export async function assinarProva(formData: FormData): Promise<Resultado> {
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sessao expirada. Entre novamente." };

  const parsed = schemaAssinar.safeParse({ provaId: formData.get("provaId") });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.errors[0].message };
  }

  try {
    await new AssinarProva(repositorio()).executar({
      provaId: parsed.data.provaId,
      assinanteId: user.id,
    });
    revalidatePath("/provas");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido.";
    return { ok: false, erro: msg };
  }
}
