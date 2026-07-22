import type { SupabaseClient } from "@supabase/supabase-js";
import { Perfil, type PapelPerfil } from "@dominio/perfil/Perfil";
import type { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";

// Adapter Supabase da porta PerfilRepositorio. Traduz entre as linhas de `perfis`
// e a entidade de dominio. Esta pasta e a unica fronteira que conhece o Supabase
// (D11, AGENTS.md). O dominio nunca importa daqui.

interface PerfilRow {
  id: string;
  usuario_id: string | null;
  handle: string;
  nome: string;
  papel: PapelPerfil;
  tags: string[] | null;
  avatar_url: string | null;
  bio: string | null;
}

const COLUNAS = "id, usuario_id, handle, nome, papel, tags, avatar_url, bio";

export class PerfilRepositorioSupabase implements PerfilRepositorio {
  constructor(private readonly cliente: SupabaseClient) {}

  async buscarPorId(id: string): Promise<Perfil | null> {
    return this.buscarUm("id", id);
  }

  async buscarPorHandle(handle: string): Promise<Perfil | null> {
    return this.buscarUm("handle", handle.trim().toLowerCase());
  }

  async buscarPorUsuario(usuarioId: string): Promise<Perfil | null> {
    return this.buscarUm("usuario_id", usuarioId);
  }

  async salvar(perfil: Perfil): Promise<void> {
    const { error } = await this.cliente.from("perfis").upsert({
      id: perfil.id,
      usuario_id: perfil.usuarioId ?? null,
      handle: perfil.handle.valor,
      nome: perfil.nome,
      papel: perfil.papel,
      tags: [...perfil.tags],
      avatar_url: perfil.avatarUrl ?? null,
      bio: perfil.bio ?? null,
      atualizado_em: new Date().toISOString(),
    });
    if (error) throw new Error(`Erro ao salvar perfil: ${error.message}`);
  }

  async buscar(termo: string, limite = 10): Promise<Perfil[]> {
    // Diretorio: ILIKE em nome OU handle. O termo vem do usuario, entao e
    // saneado antes de entrar no filtro .or() do PostgREST (que interpreta
    // virgula/parenteses/curinga como sintaxe).
    const alvo = sanitizarTermo(termo);
    if (!alvo) return [];

    const { data, error } = await this.cliente
      .from("perfis")
      .select(COLUNAS)
      .or(`nome.ilike.%${alvo}%,handle.ilike.%${alvo}%`)
      .limit(limite);
    if (error) throw new Error(`Erro ao buscar perfis: ${error.message}`);
    return ((data ?? []) as PerfilRow[]).map((r) => reconstruir(r));
  }

  private async buscarUm(
    coluna: "id" | "handle" | "usuario_id",
    valor: string,
  ): Promise<Perfil | null> {
    const { data, error } = await this.cliente
      .from("perfis")
      .select(COLUNAS)
      .eq(coluna, valor)
      .maybeSingle();
    if (error) throw new Error(`Erro ao buscar perfil: ${error.message}`);
    if (!data) return null;
    return reconstruir(data as PerfilRow);
  }
}

// Remove os caracteres com significado no filtro PostgREST (.or/.ilike) e os
// curingas, evitando injecao de sintaxe de filtro a partir do termo de busca.
function sanitizarTermo(termo: string): string {
  return (termo ?? "")
    .trim()
    .replace(/[,()*%\\:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function reconstruir(row: PerfilRow): Perfil {
  return Perfil.criar({
    id: row.id,
    usuarioId: row.usuario_id ?? undefined,
    handle: row.handle,
    nome: row.nome,
    papel: row.papel,
    tags: row.tags ?? [],
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
  });
}
