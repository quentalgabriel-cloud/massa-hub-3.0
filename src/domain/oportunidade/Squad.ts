import { Papel } from "./Papel";

// Squad — value object. Conjunto de Papeis de uma oportunidade. Carrega a
// decisao "multiplos papeis com quantidade" (spec 05, decisao 3): nunca uma
// vaga generica de "3 creators", e sim 2 de beleza + 1 de lifestyle.

export class Squad {
  private constructor(readonly papeis: readonly Papel[]) {}

  static de(papeis: Papel[]): Squad {
    if (papeis.length === 0) {
      throw new Error("Squad exige ao menos um papel.");
    }
    return new Squad([...papeis]);
  }

  // Soma das quantidades de cada papel = total de posicoes a preencher.
  totalPosicoes(): number {
    return this.papeis.reduce((total, papel) => total + papel.qtd, 0);
  }
}
