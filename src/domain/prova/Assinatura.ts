// Assinatura — value object. Representa a confirmacao de uma das partes de que
// uma Prova e real. Nao tem identidade propria: vale pelo conteudo e e imutavel.
// Ver docs/specs/01-reputacao-lastro.md e CLAUDE.md secao 3 (Prova bilateral).

export type PapelAssinatura = "criador" | "contratante";

export class Assinatura {
  private constructor(
    readonly autorId: string,
    readonly papel: PapelAssinatura,
    readonly assinadoEm: Date,
  ) {}

  static criar(props: {
    autorId: string;
    papel: PapelAssinatura;
    assinadoEm?: Date;
  }): Assinatura {
    const autorId = props.autorId?.trim();
    if (!autorId) {
      throw new Error("Assinatura exige autorId.");
    }
    if (props.papel !== "criador" && props.papel !== "contratante") {
      throw new Error(`Papel de assinatura invalido: ${String(props.papel)}`);
    }
    return new Assinatura(autorId, props.papel, props.assinadoEm ?? new Date());
  }

  igualA(outra: Assinatura): boolean {
    return this.autorId === outra.autorId && this.papel === outra.papel;
  }
}
