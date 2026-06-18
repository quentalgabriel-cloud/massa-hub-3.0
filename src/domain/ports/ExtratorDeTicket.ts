import { TicketExtraido } from "../oportunidade/TicketExtraido";

// Porta de saida para a IA. O dominio DEFINE este contrato; o adapter Anthropic
// o implementa, validando a saida do modelo contra TicketExtraido antes de
// devolver. O dominio nao conhece a Anthropic (CLAUDE.md secao 8, D11).

export interface ExtratorDeTicket {
  extrair(textoBruto: string): Promise<TicketExtraido>;
}
