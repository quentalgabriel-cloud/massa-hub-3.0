import { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";
import { EnviadorDeEmail, ResultadoEnvio } from "@dominio/ports/EnviadorDeEmail";
import { Email } from "@dominio/perfil/Email";

// Caso de uso: o assessor convida quem ele vinculou a reivindicar o próprio nó.
// É o growth loop da ativação (Fase 2) — antes, o link era copiado à mão.
//
// Regras de vizinhança que vivem aqui:
//   - só quem vinculou convida (mesma regra de VincularCreatorAoSquad);
//   - perfil já reivindicado não se convida (não há o que ativar);
//   - sem e-mail no perfil, não há para onde enviar — erro orientador.
//
// O envio NÃO lança quando o provedor falha: devolve `enviado: false` com
// motivo. O vínculo já é um fato; o convite é uma cortesia que pode ser
// refeita pelo link manual. Falhar aqui não pode parecer que o vínculo falhou.

export class ErroPerfilNaoEncontradoParaConvite extends Error {
  constructor(perfilId: string) {
    super(`Perfil "${perfilId}" não encontrado.`);
    this.name = "ErroPerfilNaoEncontradoParaConvite";
  }
}

export class ErroConviteNaoAutorizado extends Error {
  constructor() {
    super("Só quem vinculou esta pessoa pode convidá-la.");
    this.name = "ErroConviteNaoAutorizado";
  }
}

export class ErroPerfilJaAtivo extends Error {
  constructor() {
    super("Esta pessoa já reivindicou o perfil — não há o que ativar.");
    this.name = "ErroPerfilJaAtivo";
  }
}

export class ErroSemEmailParaConvite extends Error {
  constructor() {
    super(
      "Este perfil não tem e-mail de contato. Adicione um e-mail ao vincular, " +
        "ou compartilhe o link de reivindicação manualmente.",
    );
    this.name = "ErroSemEmailParaConvite";
  }
}

export interface EntradaConvidarCreator {
  perfilId: string;
  assessorId: string; // perfil.id de quem convida (da sessão, nunca do cliente)
  urlBase: string; // origem da aplicação, para montar o link
  emailAlternativo?: string; // convidar num endereço diferente do salvo
}

export interface SaidaConvidarCreator {
  enviado: boolean;
  motivo?: string;
  destinatario: string;
  linkReivindicacao: string;
}

export class ConvidarCreator {
  constructor(
    private readonly perfis: PerfilRepositorio,
    private readonly email: EnviadorDeEmail,
  ) {}

  async executar(
    entrada: EntradaConvidarCreator,
  ): Promise<SaidaConvidarCreator> {
    const perfil = await this.perfis.buscarPorId(entrada.perfilId);
    if (!perfil) {
      throw new ErroPerfilNaoEncontradoParaConvite(entrada.perfilId);
    }
    if (!perfil.estaPendente()) {
      throw new ErroPerfilJaAtivo();
    }
    if (perfil.origem?.vinculadoPorId !== entrada.assessorId) {
      throw new ErroConviteNaoAutorizado();
    }

    const destino =
      Email.criarOpcional(entrada.emailAlternativo) ?? perfil.email;
    if (!destino) throw new ErroSemEmailParaConvite();

    const link = `${entrada.urlBase.replace(/\/+$/, "")}/reivindicar/${perfil.id}`;

    const resultado: ResultadoEnvio = await this.email.enviar({
      para: destino.valor,
      assunto: `${perfil.nome}, seu perfil na Massa está esperando`,
      texto: textoConvite(perfil.nome, link),
      html: htmlConvite(perfil.nome, link),
    });

    // Convite enviado num endereço que o perfil ainda não tinha? Guarda, para
    // o próximo convite não precisar redigitar.
    if (resultado.enviado && !perfil.email) {
      await this.perfis.salvar(perfil.comEmail(destino));
    }

    return {
      enviado: resultado.enviado,
      motivo: resultado.motivo,
      destinatario: destino.valor,
      linkReivindicacao: link,
    };
  }
}

// Voz da marca: direto, sem bajulação, o fato antes do convite. O que a pessoa
// precisa saber é que já existe trabalho real ligado ao nome dela.
function textoConvite(nome: string, link: string): string {
  return [
    `${nome},`,
    "",
    "Alguém com quem você trabalhou registrou esse trabalho na Massa e",
    "vinculou você a ele. O perfil já existe — falta você assumir.",
    "",
    "Reivindicar leva um minuto e é com a sua conta Google:",
    link,
    "",
    "Na Massa, reputação não é nota nem score: é trabalho real, assinado",
    "pelos dois lados. O que estiver no seu perfil, alguém assinou junto.",
    "",
    "— Massa",
  ].join("\n");
}

function htmlConvite(nome: string, link: string): string {
  const seguro = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;color:#1a1a1f;line-height:1.55">
  <p style="font-size:16px;margin:0 0 16px">${seguro(nome)},</p>
  <p style="font-size:16px;margin:0 0 16px">
    Alguém com quem você trabalhou registrou esse trabalho na Massa e vinculou
    você a ele. <strong>O perfil já existe — falta você assumir.</strong>
  </p>
  <p style="margin:0 0 24px">
    <a href="${seguro(link)}"
       style="display:inline-block;background:#6c5bff;color:#fff;text-decoration:none;
              padding:12px 20px;border-radius:8px;font-weight:600;font-size:15px">
      Reivindicar meu perfil
    </a>
  </p>
  <p style="font-size:14px;color:#5c5a66;margin:0 0 16px">
    Leva um minuto, e é com a sua conta Google.
  </p>
  <p style="font-size:14px;color:#5c5a66;margin:0">
    Na Massa, reputação não é nota nem score: é trabalho real, assinado pelos
    dois lados. O que estiver no seu perfil, alguém assinou junto.
  </p>
</div>`;
}
