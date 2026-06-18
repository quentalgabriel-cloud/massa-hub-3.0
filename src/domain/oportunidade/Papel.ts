import { FaixaSeguidores } from "./FaixaSeguidores";

// Papel — value object. Uma funcao dentro de um squad, COM quantidade
// (ex.: "2 creators de beleza"). Squad-aware: nunca uma vaga generica.
// nicho e faixaSeguidores sao opcionais — reconciliam a spec 02 ({funcao, qtd})
// com a spec 05 ({papel, quantidade, nicho, faixaSeguidores}): a 05 e superset.

export interface DadosPapel {
  funcao: string;
  qtd: number;
  nicho?: string;
  faixaSeguidores?: FaixaSeguidores;
}

export class Papel {
  private constructor(
    readonly funcao: string,
    readonly qtd: number,
    readonly nicho: string | undefined,
    readonly faixaSeguidores: FaixaSeguidores | undefined,
  ) {}

  static criar(dados: DadosPapel): Papel {
    const funcao = dados.funcao?.trim();
    if (!funcao) {
      throw new Error("Papel exige funcao.");
    }
    if (!Number.isInteger(dados.qtd) || dados.qtd < 1) {
      throw new Error("Papel exige qtd inteira >= 1.");
    }
    const nicho = dados.nicho?.trim();
    return new Papel(
      funcao,
      dados.qtd,
      nicho ? nicho : undefined,
      dados.faixaSeguidores,
    );
  }
}
