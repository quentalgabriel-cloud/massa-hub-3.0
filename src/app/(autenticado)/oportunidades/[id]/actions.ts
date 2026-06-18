"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { CandidatarPerfil } from "@aplicacao/CandidatarPerfil";
import { OportunidadeRepositorioSupabase } from "@infra/supabase/OportunidadeRepositorioSupabase";
import { criarClienteSSR } from "@infra/supabase/cliente";

const schema = z.object({
  oportunidadeId: z.string().min(1),
});

export async function candidatar(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  // O perfil que se candidata e o usuario da SESSAO, nunca um id vindo do cliente.
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sessao expirada. Entre novamente." };

  const parsed = schema.safeParse({
    oportunidadeId: formData.get("oportunidadeId"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.errors[0].message };
  }

  try {
    const repositorio = new OportunidadeRepositorioSupabase();
    const caso = new CandidatarPerfil(repositorio);
    await caso.executar({
      oportunidadeId: parsed.data.oportunidadeId,
      perfilId: user.id,
    });
    revalidatePath(`/oportunidades/${parsed.data.oportunidadeId}`);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido.";
    return { ok: false, erro: msg };
  }
}
