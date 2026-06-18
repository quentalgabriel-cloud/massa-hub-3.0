import { describe, it, expect } from "vitest";
import { TicketExtraido } from "@dominio/oportunidade/TicketExtraido";
import { Papel } from "@dominio/oportunidade/Papel";

describe("TicketExtraido — proposta da IA validada", () => {
  it("cria um ticket com papeis e confianca valida", () => {
    const ticket = TicketExtraido.criar({
      papeis: [Papel.criar({ funcao: "skincare", qtd: 5 })],
      confianca: 0.82,
      marca: "Natura",
      budget: 25000,
      origens: [{ campo: "marca", trecho: "job da Natura" }],
    });
    expect(ticket.confianca).toBe(0.82);
    expect(ticket.marca).toBe("Natura");
    expect(ticket.papeis.length).toBe(1);
    expect(ticket.origens.length).toBe(1);
  });

  it("recusa confianca fora de 0..1 (sinal de extracao, nao score)", () => {
    const papeis = [Papel.criar({ funcao: "skincare", qtd: 1 })];
    expect(() => TicketExtraido.criar({ papeis, confianca: 1.2 })).toThrow();
    expect(() => TicketExtraido.criar({ papeis, confianca: -0.1 })).toThrow();
  });

  it("recusa budget negativo", () => {
    const papeis = [Papel.criar({ funcao: "skincare", qtd: 1 })];
    expect(() =>
      TicketExtraido.criar({ papeis, confianca: 0.5, budget: -10 }),
    ).toThrow();
  });
});
