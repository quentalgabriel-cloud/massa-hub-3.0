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

  // Deriva um handle valido a partir de texto bruto (nome do Google, e-mail).
  // Usado para provisionar o no do assessor no primeiro login — sem formulario
  // de onboarding. Best-effort: remove acento, troca separadores por hifen,
  // corta a [a-z0-9-] e ajusta o tamanho. Delega a validacao final a `criar`
  // (fonte unica da regra). Lanca se o bruto nao tem nenhum caractere aproveitavel.
  static aPartirDe(bruto: string): Handle {
    const base = (bruto ?? "").split("@")[0]; // e-mail -> parte antes do @
    const slug = base
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // remove diacriticos (joão -> joao)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // qualquer separador vira hifen
      .replace(/-+/g, "-") // colapsa hifens repetidos
      .replace(/^-+|-+$/g, "") // apara hifen das bordas
      .slice(0, 30)
      .replace(/-+$/g, ""); // o slice pode ter deixado hifen no fim

    if (slug.length < 2) {
      throw new Error(
        `Nao foi possivel derivar um handle de "${bruto}" (poucos caracteres validos).`,
      );
    }
    return Handle.criar(slug);
  }

  toString(): string {
    return this.valor;
  }

  equals(outro: Handle): boolean {
    return this.valor === outro.valor;
  }
}
