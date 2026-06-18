import { describe, it, expect, vi } from "vitest";
import { ExtrairTicket } from "@aplicacao/ExtrairTicket";
import { TicketExtraido } from "@dominio/oportunidade/TicketExtraido";
import { Papel } from "@dominio/oportunidade/Papel";

const papel = Papel.criar({ funcao: "Creator de beleza", qtd: 2 });

const ticketMock = TicketExtraido.criar({
  papeis: [papel],
  confianca: 0.9,
  marca: "Natura",
  budget: 25000,
  entregaveis: ["1 reels", "3 stories"],
});

const extratorMock = {
  extrair: vi.fn().mockResolvedValue(ticketMock),
};

describe("ExtrairTicket", () => {
  it("delega ao extrator e devolve o ticket", async () => {
    const caso = new ExtrairTicket(extratorMock);
    const resultado = await caso.executar({
      textoBruto: "Job da Natura, skincare, 5 creators NE, 25k",
      autorId: "assessor-1",
    });
    expect(resultado).toBe(ticketMock);
    expect(extratorMock.extrair).toHaveBeenCalledWith(
      "Job da Natura, skincare, 5 creators NE, 25k",
    );
  });

  it("rejeita textoBruto vazio", async () => {
    const caso = new ExtrairTicket(extratorMock);
    await expect(
      caso.executar({ textoBruto: "  ", autorId: "assessor-1" }),
    ).rejects.toThrow("textoBruto nao pode ser vazio");
  });

  it("rejeita autorId vazio", async () => {
    const caso = new ExtrairTicket(extratorMock);
    await expect(
      caso.executar({ textoBruto: "briefing valido", autorId: "" }),
    ).rejects.toThrow("autorId nao pode ser vazio");
  });
});
