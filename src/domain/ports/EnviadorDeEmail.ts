// Porta de saída para envio de e-mail. O domínio DEFINE o contrato; a
// infraestrutura escolhe o provedor (Resend, SES, SMTP…). Nada aqui sabe qual
// é — trocar de provedor é escrever outro adapter (D11).

export interface Mensagem {
  para: string;
  assunto: string;
  texto: string; // corpo em texto puro — sempre presente
  html?: string; // versão rica, opcional
}

export interface ResultadoEnvio {
  enviado: boolean;
  // Por que não enviou, quando enviado=false. O convite falhar NÃO é exceção:
  // o vínculo já aconteceu e o link manual continua valendo. A UI informa.
  motivo?: string;
}

export interface EnviadorDeEmail {
  enviar(mensagem: Mensagem): Promise<ResultadoEnvio>;
}
