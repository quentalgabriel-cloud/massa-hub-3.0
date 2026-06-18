import { ExtratorDeTicket } from "@dominio/ports/ExtratorDeTicket";
import { TicketExtraido } from "@dominio/oportunidade/TicketExtraido";

// Caso de uso: recebe o briefing bruto do assessor, delega a extracao ao adapter
// de IA (nunca conhece a Anthropic), devolve o TicketExtraido para revisao humana.
// Nada e publicado aqui — o assessor REVISA antes de chamar PublicarOportunidade.

export interface EntradaExtrairTicket {
  textoBruto: string;
  autorId: string;
}

export class ExtrairTicket {
  constructor(private readonly extrator: ExtratorDeTicket) {}

  async executar(entrada: EntradaExtrairTicket): Promise<TicketExtraido> {
    const texto = entrada.textoBruto?.trim();
    if (!texto) throw new Error("ExtrairTicket: textoBruto nao pode ser vazio.");
    if (!entrada.autorId?.trim()) {
      throw new Error("ExtrairTicket: autorId nao pode ser vazio.");
    }
    return this.extrator.extrair(texto);
  }
}
