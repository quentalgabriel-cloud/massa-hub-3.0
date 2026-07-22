// Handle — value object. O identificador publico de um perfil, usado na URL
// massahub.com.br/<handle>. Vocabulario GitHub: minusculo, curto, em mono.
// Vale pelo conteudo e e imutavel. Ver docs/specs/03-perfil-claim-assessor.md.

const TAMANHO_MIN = 3;
const TAMANHO_MAX = 30;
const FORMATO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Faixa Unicode das marcas diacriticas combinantes (acentos), usada para
// remover acentos apos normalizar em NFD. Escrita por codepoint para nao
// depender de caracteres combinantes literais no fonte.
const COMBINANTE_MIN = 0x300;
const COMBINANTE_MAX = 0x36f;

// Segmentos de rota (ou reservas de produto) que NAO podem virar handle, senao
// colidem com paginas reais. A pagina publica /<handle> e um catch-all de raiz;
// rotas estaticas tem prioridade no Next, mas bloquear aqui evita perfis-fantasma
// apontando para nomes de sistema. Manter em sincronia com src/app/.
const RESERVADOS: ReadonlySet<string> = new Set([
  "login",
  "logout",
  "signout",
  "auth",
  "api",
  "oportunidades",
  "provas",
  "perfil",
  "perfis",
  "sobre",
  "ajuda",
  "admin",
  "config",
  "configuracoes",
  "settings",
  "callback",
  "massa",
  "massahub",
  "app",
  "www",
]);

export class Handle {
  private constructor(readonly valor: string) {}

  static criar(entrada: string): Handle {
    const valor = (entrada ?? "").trim().toLowerCase();

    if (!valor) {
      throw new Error("Handle e obrigatorio.");
    }
    if (valor.length < TAMANHO_MIN || valor.length > TAMANHO_MAX) {
      throw new Error(
        `Handle deve ter entre ${TAMANHO_MIN} e ${TAMANHO_MAX} caracteres.`,
      );
    }
    if (!FORMATO.test(valor)) {
      throw new Error(
        "Handle aceita apenas letras minusculas, numeros e hifen (sem hifen no inicio, fim ou duplicado).",
      );
    }
    if (RESERVADOS.has(valor)) {
      throw new Error(`Handle reservado: ${valor}.`);
    }

    return new Handle(valor);
  }

  // Sugestao tolerante: aceita texto bruto (nome, com acento/espaco) e tenta
  // derivar um handle valido. Lanca se o resultado nao for utilizavel — quem
  // chama decide pedir outro ao usuario.
  static aPartirDeTexto(texto: string): Handle {
    const semAcento = (texto ?? "")
      .normalize("NFD")
      .split("")
      .filter((c) => {
        const cp = c.codePointAt(0) ?? 0;
        return cp < COMBINANTE_MIN || cp > COMBINANTE_MAX;
      })
      .join("");
    const base = semAcento
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // nao-alfanumerico vira hifen
      .replace(/^-+|-+$/g, ""); // apara hifens das pontas
    return Handle.criar(base);
  }

  igualA(outro: Handle): boolean {
    return this.valor === outro.valor;
  }

  toString(): string {
    return this.valor;
  }
}
