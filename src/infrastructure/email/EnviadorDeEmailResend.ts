import type {
  EnviadorDeEmail,
  Mensagem,
  ResultadoEnvio,
} from "@dominio/ports/EnviadorDeEmail";

// Adapter de envio via Resend, por HTTP direto (sem SDK — uma dependência a
// menos para manter). O domínio não conhece este arquivo (D11).
//
// Degrada, não quebra: sem RESEND_API_KEY configurada, devolve
// `enviado: false` com motivo em vez de lançar. O convite é cortesia sobre um
// vínculo que já existe — e o link manual continua funcionando. Isso mantém a
// Massa utilizável antes de o e-mail estar configurado.

const ENDPOINT = "https://api.resend.com/emails";

// Remetente padrão do sandbox do Resend: funciona sem domínio verificado, útil
// para os primeiros testes. Com domínio próprio, definir EMAIL_REMETENTE
// (ex.: "Massa <convite@massahub.com.br>") — sem isso, provedores de e-mail
// tratam a mensagem com mais desconfiança.
const REMETENTE_PADRAO = "Massa <onboarding@resend.dev>";

export class EnviadorDeEmailResend implements EnviadorDeEmail {
  async enviar(mensagem: Mensagem): Promise<ResultadoEnvio> {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      return {
        enviado: false,
        motivo:
          "Envio de e-mail não configurado (RESEND_API_KEY ausente). " +
          "Use o link de reivindicação manualmente.",
      };
    }

    try {
      const resposta = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_REMETENTE?.trim() || REMETENTE_PADRAO,
          to: [mensagem.para],
          subject: mensagem.assunto,
          text: mensagem.texto,
          ...(mensagem.html ? { html: mensagem.html } : {}),
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!resposta.ok) {
        // Corpo do erro ajuda a distinguir chave inválida de domínio não
        // verificado — mas não vaza a chave, que nunca entra no corpo.
        const detalhe = await resposta.text().catch(() => "");
        return {
          enviado: false,
          motivo: `Provedor recusou o envio (HTTP ${resposta.status}). ${detalhe.slice(0, 200)}`,
        };
      }

      return { enviado: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { enviado: false, motivo: `Falha ao contatar o provedor: ${msg}` };
    }
  }
}
