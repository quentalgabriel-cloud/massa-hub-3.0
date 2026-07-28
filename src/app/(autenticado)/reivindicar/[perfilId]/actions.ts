"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ReivindicarPerfil } from "@aplicacao/ReivindicarPerfil";
import { PerfilRepositorioSupabase } from "@infra/supabase/PerfilRepositorioSupabase";
import { criarClienteSSR } from "@infra/supabase/cliente";

const schema = z.object({
  perfilId: z.string().min(1),
});

// A pessoa real assume o perfil pendente que um assessor deixou ancorado numa
// oportunidade (spec 03). O usuarioId vem SEMPRE da sessao (Google auth),
// nunca do cliente. A transicao e do dominio (Perfil.reivindicar) e as regras
// de vizinhanca ("uma identidade, um no") vivem no caso de uso ReivindicarPerfil.
export async function reivindicar(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sessao expirada. Entre novamente." };

  const parsed = schema.safeParse({ perfilId: formData.get("perfilId") });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.errors[0].message };
  }

  try {
    const caso = new ReivindicarPerfil(new PerfilRepositorioSupabase());
    await caso.executar({ perfilId: parsed.data.perfilId, usuarioId: user.id });
    revalidatePath(`/reivindicar/${parsed.data.perfilId}`);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido.";
    return { ok: false, erro: msg };
  }
}
