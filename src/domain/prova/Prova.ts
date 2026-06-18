import { Assinatura } from "./Assinatura";

// Prova — entidade. Unidade atomica de reputacao na Massa Hub: um registro de
// trabalho real, assinado pelos dois lados (quem fez + quem contratou). E o
// equivalente ao commit co-autorado do GitHub. Reputacao = lastro, nunca score
// (CLAUDE.md secao 3, decisao D1). Ver docs/specs/01-reputacao-lastro.md.

export type TipoProva =
  | "campanha"
  | "consultoria"
  | "festival"
  | "negociacao"
  | "outro";

// Status e DERIVADO das assinaturas, nunca atribuido a mao:
// - em_andamento: ainda nao confirmada pelos dois lados
// - verificada: assinada por criador E contratante (bilateral)
export type StatusProva = "em_andamento" | "verificada";

const TIPOS_VALIDOS: readonly TipoProva[] = [
  "campanha",
  "consultoria",
  "festival",
  "negociacao",
  "outro",
];

export interface DadosProva {
  id: string;
  tipo: TipoProva;
  titulo: string;
  descricao: string;
  criadorId: string; // profissional/autor do trabalho
  contratanteId: string; // marca/contratante
  resultado?: string; // texto livre verificavel ("+2,3M impressoes")
  participantes?: string[]; // squad: refs de colaboradores (formam o grafo)
  data?: Date;
  assinaturas?: Assinatura[];
}

export class Prova {
  private constructor(
    readonly id: string,
    readonly tipo: TipoProva,
    readonly titulo: string,
    readonly descricao: string,
    readonly criadorId: string,
    readonly contratanteId: string,
    readonly resultado: string | undefined,
    readonly participantes: readonly string[],
    readonly data: Date,
    readonly assinaturas: readonly Assinatura[],
  ) {}

  static criar(dados: DadosProva): Prova {
    const id = dados.id?.trim();
    const titulo = dados.titulo?.trim();
    const descricao = dados.descricao?.trim();
    const criadorId = dados.criadorId?.trim();
    const contratanteId = dados.contratanteId?.trim();

    if (!id) throw new Error("Prova exige id.");
    if (!titulo) throw new Error("Prova exige titulo.");
    if (!descricao) throw new Error("Prova exige descricao.");
    if (!criadorId) throw new Error("Prova exige criadorId.");
    if (!contratanteId) throw new Error("Prova exige contratanteId.");
    if (criadorId === contratanteId) {
      throw new Error(
        "Criador e contratante nao podem ser a mesma parte (prova e bilateral).",
      );
    }
    if (!TIPOS_VALIDOS.includes(dados.tipo)) {
      throw new Error(`Tipo de prova invalido: ${String(dados.tipo)}`);
    }

    const assinaturas = dados.assinaturas ?? [];
    const autores = new Set<string>();
    for (const assinatura of assinaturas) {
      if (autores.has(assinatura.autorId)) {
        throw new Error(
          `Autor ${assinatura.autorId} assinou a prova mais de uma vez.`,
        );
      }
      autores.add(assinatura.autorId);
    }

    const resultado = dados.resultado?.trim();
    return new Prova(
      id,
      dados.tipo,
      titulo,
      descricao,
      criadorId,
      contratanteId,
      resultado ? resultado : undefined,
      [...(dados.participantes ?? [])],
      dados.data ?? new Date(),
      [...assinaturas],
    );
  }

  // Imutavel: retorna uma NOVA prova com a assinatura adicionada.
  // AGENTS.md secao 5: padroes imutaveis, nunca mutar.
  assinar(assinatura: Assinatura): Prova {
    if (this.assinaturas.some((a) => a.autorId === assinatura.autorId)) {
      throw new Error(`Autor ${assinatura.autorId} ja assinou esta prova.`);
    }
    return Prova.criar({
      id: this.id,
      tipo: this.tipo,
      titulo: this.titulo,
      descricao: this.descricao,
      criadorId: this.criadorId,
      contratanteId: this.contratanteId,
      resultado: this.resultado,
      participantes: [...this.participantes],
      data: this.data,
      assinaturas: [...this.assinaturas, assinatura],
    });
  }

  // Verificada = assinada pelos DOIS lados (um criador + um contratante).
  // Implica >= 2 assinaturas. Nao existe score numerico (D1).
  estaVerificada(): boolean {
    const temCriador = this.assinaturas.some((a) => a.papel === "criador");
    const temContratante = this.assinaturas.some(
      (a) => a.papel === "contratante",
    );
    return temCriador && temContratante;
  }

  get status(): StatusProva {
    return this.estaVerificada() ? "verificada" : "em_andamento";
  }
}
