// FaixaSeguidores — value object. Faixa de seguidores buscada (ex.: 50k-300k).
// max e opcional (faixa aberta, "50k+"). Ver docs/specs/02-modulo-oportunidades.md.

export class FaixaSeguidores {
  private constructor(
    readonly min: number,
    readonly max: number | undefined,
  ) {}

  static criar(min: number, max?: number): FaixaSeguidores {
    if (!Number.isInteger(min) || min < 0) {
      throw new Error("FaixaSeguidores: min deve ser inteiro nao-negativo.");
    }
    if (max !== undefined) {
      if (!Number.isInteger(max) || max < min) {
        throw new Error("FaixaSeguidores: max deve ser inteiro >= min.");
      }
    }
    return new FaixaSeguidores(min, max);
  }
}
