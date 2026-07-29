import { criarClienteServidor } from "./cliente";
import type { OportunidadeRepositorio } from "@dominio/ports/OportunidadeRepositorio";
import {
  Oportunidade,
  type StatusOportunidade,
  type OrigemOportunidade,
} from "@dominio/oportunidade/Oportunidade";
import { Squad } from "@dominio/oportunidade/Squad";
import { Papel } from "@dominio/oportunidade/Papel";
import { FaixaSeguidores } from "@dominio/oportunidade/FaixaSeguidores";

// Adapter Supabase da porta OportunidadeRepositorio.
// squad, entregaveis e candidaturas sao persistidos como JSONB/array no Postgres.
// O dominio nao conhece o Supabase — este e o unico ponto de acoplamento (D11).

interface PapelRow {
  funcao: string;
  qtd: number;
  nicho?: string | null;
  seguidores_min?: number | null;
  seguidores_max?: number | null;
}

interface OportunidadeRow {
  id: string;
  autor_id: string;
  marca: string;
  status: StatusOportunidade;
  budget: number | null;
  prazo: string | null;
  local: string | null;
  regiao: string | null;
  entregaveis: string[];
  candidaturas: string[];
  papeis: PapelRow[];
  origem_texto_bruto: string;
  origem_estruturado_por_ia: boolean;
  origem_revisado_pelo_autor: boolean;
}

const COLUNAS =
  "id, autor_id, marca, status, budget, prazo, local, regiao, " +
  "entregaveis, candidaturas, papeis, " +
  "origem_texto_bruto, origem_estruturado_por_ia, origem_revisado_pelo_autor";

function rowParaOportunidade(row: OportunidadeRow): Oportunidade {
  const papeis = (row.papeis ?? []).map((p) =>
    Papel.criar({
      funcao: p.funcao,
      qtd: p.qtd,
      nicho: p.nicho ?? undefined,
      faixaSeguidores:
        p.seguidores_min != null
          ? FaixaSeguidores.criar(
              p.seguidores_min,
              p.seguidores_max ?? undefined,
            )
          : undefined,
    }),
  );

  const squad = Squad.de(papeis);

  const origem: OrigemOportunidade = {
    textoBruto: row.origem_texto_bruto,
    estruturadoPorIA: row.origem_estruturado_por_ia,
    revisadoPeloAutor: row.origem_revisado_pelo_autor,
  };

  return Oportunidade.criar({
    id: row.id,
    autorId: row.autor_id,
    marca: row.marca,
    squad,
    origem,
    status: row.status,
    budget: row.budget ?? undefined,
    prazo: row.prazo ? new Date(row.prazo) : undefined,
    local: row.local ?? undefined,
    regiao: row.regiao ?? undefined,
    entregaveis: row.entregaveis ?? [],
    candidaturas: row.candidaturas ?? [],
  });
}

function oportunidadeParaRow(
  o: Oportunidade,
): Omit<OportunidadeRow, never> {
  return {
    id: o.id,
    autor_id: o.autorId,
    marca: o.marca,
    status: o.status,
    budget: o.budget ?? null,
    prazo: o.prazo ? o.prazo.toISOString().split("T")[0] : null,
    local: o.local ?? null,
    regiao: o.regiao ?? null,
    entregaveis: [...o.entregaveis],
    candidaturas: [...o.candidaturas],
    papeis: o.squad.papeis.map((p) => ({
      funcao: p.funcao,
      qtd: p.qtd,
      nicho: p.nicho ?? null,
      seguidores_min: p.faixaSeguidores?.min ?? null,
      seguidores_max: p.faixaSeguidores?.max ?? null,
    })),
    origem_texto_bruto: o.origem.textoBruto,
    origem_estruturado_por_ia: o.origem.estruturadoPorIA,
    origem_revisado_pelo_autor: o.origem.revisadoPeloAutor,
  };
}

export class OportunidadeRepositorioSupabase implements OportunidadeRepositorio {
  private get cliente() {
    return criarClienteServidor();
  }

  async buscarPorId(id: string): Promise<Oportunidade | null> {
    const { data, error } = await this.cliente
      .from("oportunidades")
      .select(COLUNAS)
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return rowParaOportunidade(data as unknown as OportunidadeRow);
  }

  async salvar(oportunidade: Oportunidade): Promise<void> {
    const row = oportunidadeParaRow(oportunidade);
    const { error } = await this.cliente
      .from("oportunidades")
      .upsert(row, { onConflict: "id" });

    if (error) {
      throw new Error(`OportunidadeRepositorioSupabase.salvar: ${error.message}`);
    }
  }

  async listarAbertas(limite = 50): Promise<Oportunidade[]> {
    const { data, error } = await this.cliente
      .from("oportunidades")
      .select(COLUNAS)
      .eq("status", "aberta")
      .order("criado_em", { ascending: false })
      .limit(limite);

    if (error || !data) return [];
    return (data as unknown as OportunidadeRow[]).map(rowParaOportunidade);
  }

  async listarPorAutor(autorId: string): Promise<Oportunidade[]> {
    const { data, error } = await this.cliente
      .from("oportunidades")
      .select(COLUNAS)
      .eq("autor_id", autorId)
      .order("criado_em", { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return (data as unknown as OportunidadeRow[]).map(rowParaOportunidade);
  }

  async listarPorAutores(autorIds: string[]): Promise<Oportunidade[]> {
    const ids = [...new Set(autorIds)];
    if (ids.length === 0) return [];

    const { data, error } = await this.cliente
      .from("oportunidades")
      .select(COLUNAS)
      .in("autor_id", ids)
      .order("criado_em", { ascending: false })
      .limit(500);

    if (error || !data) return [];
    return (data as unknown as OportunidadeRow[]).map(rowParaOportunidade);
  }
}
