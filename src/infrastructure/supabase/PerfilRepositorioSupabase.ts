import { criarClienteServidor } from "./cliente";
import type { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";
import {
  Perfil,
  type TipoPerfil,
  type EstadoPerfil,
  type OrigemPerfil,
} from "@dominio/perfil/Perfil";
import { Handle } from "@dominio/perfil/Handle";
import { Email } from "@dominio/perfil/Email";

// Adapter Supabase da porta PerfilRepositorio. A origem (ancora D7) e persistida
// em colunas planas (origem_*); o handle, como string normalizada. O dominio nao
// conhece o Supabase — este e o unico ponto de acoplamento (D11).

interface PerfilRow {
  id: string;
  tipo: TipoPerfil;
  nome: string;
  handle: string;
  estado: EstadoPerfil;
  usuario_id: string | null;
  origem_oportunidade_id: string | null;
  origem_vinculado_por_id: string | null;
  origem_vinculado_em: string | null;
  email: string | null;
}

const COLUNAS =
  "id, tipo, nome, handle, estado, usuario_id, " +
  "origem_oportunidade_id, origem_vinculado_por_id, origem_vinculado_em, email";

function rowParaPerfil(row: PerfilRow): Perfil {
  const origem: OrigemPerfil | undefined =
    row.origem_oportunidade_id && row.origem_vinculado_por_id
      ? {
          oportunidadeId: row.origem_oportunidade_id,
          vinculadoPorId: row.origem_vinculado_por_id,
          vinculadoEm: row.origem_vinculado_em
            ? new Date(row.origem_vinculado_em)
            : new Date(),
        }
      : undefined;

  return Perfil.criar({
    id: row.id,
    tipo: row.tipo,
    nome: row.nome,
    handle: Handle.criar(row.handle),
    estado: row.estado,
    usuarioId: row.usuario_id ?? undefined,
    origem,
    // Tolerante na leitura: um e-mail malformado que tenha entrado por fora
    // (import, correção manual) não deve derrubar a leitura do perfil inteiro.
    email: (() => {
      try {
        return Email.criarOpcional(row.email);
      } catch {
        return undefined;
      }
    })(),
  });
}

function perfilParaRow(p: Perfil): PerfilRow {
  return {
    id: p.id,
    tipo: p.tipo,
    nome: p.nome,
    handle: p.handle.valor,
    estado: p.estado,
    usuario_id: p.usuarioId ?? null,
    origem_oportunidade_id: p.origem?.oportunidadeId ?? null,
    origem_vinculado_por_id: p.origem?.vinculadoPorId ?? null,
    origem_vinculado_em: p.origem?.vinculadoEm.toISOString() ?? null,
    email: p.email?.valor ?? null,
  };
}

export class PerfilRepositorioSupabase implements PerfilRepositorio {
  private get cliente() {
    return criarClienteServidor();
  }

  async buscarPorId(id: string): Promise<Perfil | null> {
    const { data, error } = await this.cliente
      .from("perfis")
      .select(COLUNAS)
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return rowParaPerfil(data as unknown as PerfilRow);
  }

  async buscarPorIds(ids: string[]): Promise<Perfil[]> {
    if (ids.length === 0) return [];
    const { data, error } = await this.cliente
      .from("perfis")
      .select(COLUNAS)
      .in("id", ids);

    if (error || !data) return [];
    return (data as unknown as PerfilRow[]).map(rowParaPerfil);
  }

  async buscarPorHandle(handle: string): Promise<Perfil | null> {
    const { data, error } = await this.cliente
      .from("perfis")
      .select(COLUNAS)
      .eq("handle", handle)
      .single();

    if (error || !data) return null;
    return rowParaPerfil(data as unknown as PerfilRow);
  }

  async buscarPorUsuario(usuarioId: string): Promise<Perfil | null> {
    const { data, error } = await this.cliente
      .from("perfis")
      .select(COLUNAS)
      .eq("usuario_id", usuarioId)
      .single();

    if (error || !data) return null;
    return rowParaPerfil(data as unknown as PerfilRow);
  }

  async salvar(perfil: Perfil): Promise<void> {
    const row = perfilParaRow(perfil);
    const { error } = await this.cliente
      .from("perfis")
      .upsert(row, { onConflict: "id" });

    if (error) {
      throw new Error(`PerfilRepositorioSupabase.salvar: ${error.message}`);
    }
  }

  async listarPendentesVinculadosPor(assessorId: string): Promise<Perfil[]> {
    const { data, error } = await this.cliente
      .from("perfis")
      .select(COLUNAS)
      .eq("estado", "pendente")
      .eq("origem_vinculado_por_id", assessorId)
      .order("criado_em", { ascending: false })
      .limit(100);

    if (error || !data) return [];
    return (data as unknown as PerfilRow[]).map(rowParaPerfil);
  }
}
