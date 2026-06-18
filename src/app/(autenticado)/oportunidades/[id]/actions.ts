"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { CandidatarPerfil } from "@aplicacao/CandidatarPerfil";
import { OportunidadeRepositorioSupabase } from "@infra/supabase/OportunidadeRepositorioSupabase";

const schema = z.object({
  oportunidadeId: z.string().min(1),
  perfilId: z.string().min(1),
});

export async function candidatar(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const parsed = schema.safeParse({
    oportunidadeId: formData.get("oportunidadeId"),
    perfilId: formData.get("perfilId"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.errors[0].message };
  }

  try {
    const repositorio = new OportunidadeRepositorioSupabase();
    const caso = new CandidatarPerfil(repositorio);
    await caso.executar(parsed.data);
    revalidatePath(`/oportunidades/${parsed.data.oportunidadeId}`);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido.";
    return { ok: false, erro: msg };
  }
}
