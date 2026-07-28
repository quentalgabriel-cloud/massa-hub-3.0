"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { RegistrarProva } from "@aplicacao/RegistrarProva";
import { AssinarProva } from "@aplicacao/AssinarProva";
import { ResolverPerfis } from "@aplicacao/ResolverPerfis";
import { ProvaRepositorioSupabase } from "@infra/supabase/ProvaRepositorioSupabase";
import { PerfilRepositorioSupabase } from "@infra/supabase/PerfilRepositorioSupabase";
import { criarClienteServidor, criarClienteSSR } from "@infra/supabase/cliente";

type Resultado = { ok: true } | { ok: false; erro: string };

function repositorio() {
  return new ProvaRepositorioSupabase(criarClienteServidor());
}

// A Prova é entre NÓS DA REDE (perfilId), nunca entre ids de auth — senão o
// Lastro não aparece no /handle, que lê provas por perfil.id.
function resolvedor() {
  return new ResolverPerfis(new PerfilRepositorioSupabase());
}

const schemaRegistrar = z.object({
  tipo: z.enum(["campanha", "consultoria", "festival", "negociacao", "outro"]),
  titulo: z.string().min(1, "Titulo obrigatorio."),
  descricao: z.string().min(1, "Descricao obrigatoria."),
  resultado: z.string().optional(),
  ladoRegistrante: z.enum(["criador", "contratante"]),
  outraParteHandle: z.string().min(1, "Informe o @handle da outra parte."),
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
    outraParteHandle: formData.get("outraParteHandle"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.errors[0].message };
  }

  const d = parsed.data;
  const ehCriador = d.ladoRegistrante === "criador";
  try {
    // Identidades como nós da rede: eu (sessão) e a outra parte (@handle).
    const perfis = resolvedor();
    const eu = await perfis.doUsuario(user.id);
    const outra = await perfis.porHandle(d.outraParteHandle);

    await new RegistrarProva(repositorio()).executar({
      id: crypto.randomUUID(),
      tipo: d.tipo,
      titulo: d.titulo,
      descricao: d.descricao,
      resultado: d.resultado,
      criadorId: ehCriador ? eu.id : outra.id,
      contratanteId: ehCriador ? outra.id : eu.id,
      registranteId: eu.id,
      ladoRegistrante: d.ladoRegistrante,
    });
    revalidatePath("/provas");
    revalidatePath(`/${eu.handle.valor}`);
    revalidatePath(`/${outra.handle.valor}`);
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
    // Assina como nó da rede (perfil.id), o mesmo id gravado na prova.
    const eu = await resolvedor().doUsuario(user.id);
    await new AssinarProva(repositorio()).executar({
      provaId: parsed.data.provaId,
      assinanteId: eu.id,
    });
    revalidatePath("/provas");
    // A prova pode ter virado verificada — o Lastro público muda.
    revalidatePath(`/${eu.handle.valor}`);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido.";
    return { ok: false, erro: msg };
  }
}
