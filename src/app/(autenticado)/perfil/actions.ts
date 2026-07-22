"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { CriarOuAtualizarPerfilProprio } from "@aplicacao/CriarOuAtualizarPerfilProprio";
import { PerfilRepositorioSupabase } from "@infra/supabase/PerfilRepositorioSupabase";
import { criarClienteServidor, criarClienteSSR } from "@infra/supabase/cliente";

type Resultado = { ok: true; handle: string } | { ok: false; erro: string };

const schema = z.object({
  handle: z.string().min(1, "Handle obrigatorio."),
  nome: z.string().min(1, "Nome obrigatorio."),
  papel: z.enum(["assessor", "creator", "profissional"]),
  tags: z.string().optional(),
  bio: z.string().optional(),
});

export async function salvarPerfil(formData: FormData): Promise<Resultado> {
  // Identidade sempre da SESSAO, nunca do FormData.
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sessao expirada. Entre novamente." };

  const parsed = schema.safeParse({
    handle: formData.get("handle"),
    nome: formData.get("nome"),
    papel: formData.get("papel"),
    tags: formData.get("tags") || undefined,
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.errors[0].message };
  }

  const d = parsed.data;
  const tags = (d.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  try {
    const repo = new PerfilRepositorioSupabase(criarClienteServidor());
    const perfil = await new CriarOuAtualizarPerfilProprio(repo).executar({
      usuarioId: user.id,
      handle: d.handle,
      nome: d.nome,
      papel: d.papel,
      tags,
      bio: d.bio,
    });
    revalidatePath("/perfil");
    revalidatePath(`/${perfil.handle.valor}`);
    return { ok: true, handle: perfil.handle.valor };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido.";
    return { ok: false, erro: msg };
  }
}
