// Email — value object. Endereço de contato de um perfil, usado para convidar
// alguém a reivindicar o próprio nó (ativação, Fase 2).
//
// Não é identidade: quem identifica é o Handle (público) e o usuarioId (auth).
// O e-mail é opcional em Perfil justamente por isso — um perfil pendente vale
// pela âncora de trabalho (D7), não por ter contato.
//
// Validação deliberadamente frouxa: o objetivo é evitar erro de digitação
// óbvio, não policiar a RFC 5322. Endereço só se prova válido quando entrega.

export class Email {
  private constructor(readonly valor: string) {}

  static criar(bruto: string): Email {
    const valor = (bruto ?? "").trim().toLowerCase();
    if (!valor) {
      throw new Error("Email exige valor.");
    }
    if (valor.length > 254) {
      throw new Error("Email longo demais (maximo 254 caracteres).");
    }
    // uma @, algo antes, e um dominio com ponto depois — sem espacos.
    if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(valor)) {
      throw new Error(`Email invalido: "${bruto}".`);
    }
    return new Email(valor);
  }

  // Conveniência para campos opcionais: undefined entra, undefined sai.
  static criarOpcional(bruto: string | undefined | null): Email | undefined {
    const valor = (bruto ?? "").trim();
    return valor ? Email.criar(valor) : undefined;
  }

  toString(): string {
    return this.valor;
  }

  equals(outro: Email): boolean {
    return this.valor === outro.valor;
  }
}
