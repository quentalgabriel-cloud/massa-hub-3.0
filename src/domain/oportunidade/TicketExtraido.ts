import { Papel } from "./Papel";

// TicketExtraido — value object. E a PROPOSTA que a IA devolve a partir do
// briefing bruto, ANTES da revisao humana. O adapter Anthropic valida a saida
// do modelo contra este contrato (spec 02: nunca confiar cegamente no texto).
//
// `confianca` (0..1) e a confianca de EXTRACAO da IA — sinaliza briefing raso
// (spec 05, decisao 4). NAO e score de reputacao; o D1 proibe score de
// reputacao, nao este sinal de qualidade da extracao.

// Trecho do texto bruto que originou um campo — alimenta o "realce de origem"
// (spec 05, decisao 2). Offsets ficam para a camada de apresentacao.
export interface OrigemCampo {
  campo: string;
  trecho: string;
}

export interface DadosTicketExtraido {
  papeis: Papel[];
  confianca: number;
  marca?: string;
  budget?: number;
  prazo?: Date;
  local?: string;
  regiao?: string;
  entregaveis?: string[];
  origens?: OrigemCampo[];
}

export class TicketExtraido {
  private constructor(
    readonly papeis: readonly Papel[],
    readonly confianca: number,
    readonly marca: string | undefined,
    readonly budget: number | undefined,
    readonly prazo: Date | undefined,
    readonly local: string | undefined,
    readonly regiao: string | undefined,
    readonly entregaveis: readonly string[],
    readonly origens: readonly OrigemCampo[],
  ) {}

  static criar(dados: DadosTicketExtraido): TicketExtraido {
    if (
      typeof dados.confianca !== "number" ||
      Number.isNaN(dados.confianca) ||
      dados.confianca < 0 ||
      dados.confianca > 1
    ) {
      throw new Error("TicketExtraido: confianca deve estar entre 0 e 1.");
    }
    if (dados.budget !== undefined && dados.budget < 0) {
      throw new Error("TicketExtraido: budget nao pode ser negativo.");
    }
    return new TicketExtraido(
      [...dados.papeis],
      dados.confianca,
      dados.marca?.trim() || undefined,
      dados.budget,
      dados.prazo,
      dados.local?.trim() || undefined,
      dados.regiao?.trim() || undefined,
      [...(dados.entregaveis ?? [])],
      [...(dados.origens ?? [])],
    );
  }
}
