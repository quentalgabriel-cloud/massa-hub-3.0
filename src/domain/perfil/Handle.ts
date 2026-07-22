// Handle — value object. O identificador publico do perfil, usado na URL
// (massahub.com.br/handle). Vocabulario GitHub: minusculo, sem espaco, slug
// estavel. Normaliza na criacao — nunca guardar duas variacoes do mesmo handle.

export class Handle {
  private constructor(readonly valor: string) {}

  static criar(bruto: string): Handle {
    const valor = (bruto ?? "").trim().toLowerCase();
    if (!valor) {
      throw new Error("Handle exige valor.");
    }
    if (valor.length < 2 || valor.length > 30) {
      throw new Error("Handle deve ter entre 2 e 30 caracteres.");
    }
    if (!/^[a-z0-9-]+$/.test(valor)) {
      throw new Error(
        "Handle so aceita letras minusculas, numeros e hifen ([a-z0-9-]).",
      );
    }
    if (valor.startsWith("-") || valor.endsWith("-")) {
      throw new Error("Handle nao pode comecar nem terminar com hifen.");
    }
    return new Handle(valor);
  }

  toString(): string {
    return this.valor;
  }

  equals(outro: Handle): boolean {
    return this.valor === outro.valor;
  }
}
