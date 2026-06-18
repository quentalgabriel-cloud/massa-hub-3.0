import { Prova } from "./Prova";

// Lastro — value object. NAO e uma nota nem um score (decisao D1, constitucional).
// E a soma de FATOS contaveis derivados das Provas verificadas. Renderiza como
// numeros crus + rotulo. Ver docs/specs/01-reputacao-lastro.md.
//
// Por design NAO existe nenhum metodo que reduza isto a um numero unico
// (Trust Index, capital reputacional, etc.). Se alguem tentar adicionar,
// prevalece a decisao D1.

export class Lastro {
  private constructor(
    readonly nProvasVerificadas: number,
    readonly marcasDistintas: number,
    readonly marcasRecorrentes: number,
    readonly nRecomendacoes: number,
  ) {}

  // Deriva o lastro de um conjunto de provas. So provas VERIFICADAS contam.
  // nRecomendacoes e um fato externo (recomendacoes de colaboradores),
  // contado a parte das provas.
  static deProvas(provas: readonly Prova[], nRecomendacoes = 0): Lastro {
    if (!Number.isInteger(nRecomendacoes) || nRecomendacoes < 0) {
      throw new Error("nRecomendacoes deve ser um inteiro nao-negativo.");
    }

    const verificadas = provas.filter((p) => p.estaVerificada());

    const contagemPorMarca = new Map<string, number>();
    for (const prova of verificadas) {
      contagemPorMarca.set(
        prova.contratanteId,
        (contagemPorMarca.get(prova.contratanteId) ?? 0) + 1,
      );
    }

    let marcasRecorrentes = 0;
    for (const total of contagemPorMarca.values()) {
      if (total >= 2) marcasRecorrentes += 1;
    }

    return new Lastro(
      verificadas.length,
      contagemPorMarca.size,
      marcasRecorrentes,
      nRecomendacoes,
    );
  }

  static vazio(): Lastro {
    return new Lastro(0, 0, 0, 0);
  }
}
