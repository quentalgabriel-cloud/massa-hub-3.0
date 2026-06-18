import { Squad } from "./Squad";

// Oportunidade — entidade. O ticket estruturado e publicado no mercado. Nasce
// de um TicketExtraido APOS revisao humana (spec 02: "nada publica sem revisao").
// Ver docs/specs/02-modulo-oportunidades.md.

export type StatusOportunidade = "aberta" | "em_selecao" | "fechada";

export interface OrigemOportunidade {
  textoBruto: string; // briefing original colado pelo assessor
  estruturadoPorIA: boolean; // sempre true nesta fase
  revisadoPeloAutor: boolean; // humano confirmou os campos antes de publicar
}

export interface DadosOportunidade {
  id: string;
  autorId: string; // assessor/agencia que abriu
  marca: string;
  squad: Squad;
  origem: OrigemOportunidade;
  budget?: number;
  prazo?: Date;
  local?: string;
  regiao?: string;
  entregaveis?: string[];
  candidaturas?: string[];
  status?: StatusOportunidade;
}

export class Oportunidade {
  private constructor(
    readonly id: string,
    readonly autorId: string,
    readonly marca: string,
    readonly squad: Squad,
    readonly origem: OrigemOportunidade,
    readonly budget: number | undefined,
    readonly prazo: Date | undefined,
    readonly local: string | undefined,
    readonly regiao: string | undefined,
    readonly entregaveis: readonly string[],
    readonly candidaturas: readonly string[],
    readonly status: StatusOportunidade,
  ) {}

  static criar(dados: DadosOportunidade): Oportunidade {
    const id = dados.id?.trim();
    const autorId = dados.autorId?.trim();
    const marca = dados.marca?.trim();
    if (!id) throw new Error("Oportunidade exige id.");
    if (!autorId) throw new Error("Oportunidade exige autorId.");
    if (!marca) throw new Error("Oportunidade exige marca.");
    if (dados.budget !== undefined && dados.budget < 0) {
      throw new Error("Oportunidade: budget nao pode ser negativo.");
    }

    const status = dados.status ?? "aberta";
    // Nada publica sem revisao humana (spec 02). Uma oportunidade visivel no
    // mercado (aberta | em_selecao) exige revisadoPeloAutor === true.
    if (status !== "fechada" && !dados.origem.revisadoPeloAutor) {
      throw new Error(
        "Oportunidade so e publicada apos revisao humana (revisadoPeloAutor).",
      );
    }

    return new Oportunidade(
      id,
      autorId,
      marca,
      dados.squad,
      dados.origem,
      dados.budget,
      dados.prazo,
      dados.local?.trim() || undefined,
      dados.regiao?.trim() || undefined,
      [...(dados.entregaveis ?? [])],
      [...(dados.candidaturas ?? [])],
      status,
    );
  }

  candidatar(perfilId: string): Oportunidade {
    const ref = perfilId?.trim();
    if (!ref) throw new Error("Candidatura exige perfilId.");
    if (this.status === "fechada") {
      throw new Error("Oportunidade fechada nao aceita candidaturas.");
    }
    if (this.candidaturas.includes(ref)) return this; // idempotente
    return Oportunidade.criar({
      ...this.paraDados(),
      candidaturas: [...this.candidaturas, ref],
    });
  }

  iniciarSelecao(): Oportunidade {
    if (this.status !== "aberta") {
      throw new Error("Selecao so inicia a partir de uma oportunidade aberta.");
    }
    return Oportunidade.criar({ ...this.paraDados(), status: "em_selecao" });
  }

  fechar(): Oportunidade {
    if (this.status === "fechada") return this;
    return Oportunidade.criar({ ...this.paraDados(), status: "fechada" });
  }

  private paraDados(): DadosOportunidade {
    return {
      id: this.id,
      autorId: this.autorId,
      marca: this.marca,
      squad: this.squad,
      origem: this.origem,
      budget: this.budget,
      prazo: this.prazo,
      local: this.local,
      regiao: this.regiao,
      entregaveis: [...this.entregaveis],
      candidaturas: [...this.candidaturas],
      status: this.status,
    };
  }
}
