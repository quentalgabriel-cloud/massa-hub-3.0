import { describe, it, expect, vi } from "vitest";
import { PublicarOportunidade } from "@aplicacao/PublicarOportunidade";
import { TicketExtraido } from "@dominio/oportunidade/TicketExtraido";
import { Papel } from "@dominio/oportunidade/Papel";

const papel = Papel.criar({ funcao: "Creator de beleza", qtd: 2 });

const ticket = TicketExtraido.criar({
  papeis: [papel],
  confianca: 0.85,
  marca: "Natura",
  budget: 25000,
  entregaveis: ["1 reels", "3 stories"],
});

const repositorioMock = {
  buscarPorId: vi.fn(),
  salvar: vi.fn().mockResolvedValue(undefined),
  listarAbertas: vi.fn(),
  listarPorAutor: vi.fn(),
};

describe("PublicarOportunidade", () => {
  it("cria e persiste a oportunidade com revisadoPeloAutor=true", async () => {
    const caso = new PublicarOportunidade(repositorioMock);
    const resultado = await caso.executar({
      id: "op-1",
      autorId: "assessor-1",
      ticket,
      textoBruto: "Job da Natura...",
      revisadoPeloAutor: true,
    });
    expect(resultado.id).toBe("op-1");
    expect(resultado.marca).toBe("Natura");
    expect(resultado.status).toBe("aberta");
    expect(resultado.origem.revisadoPeloAutor).toBe(true);
    expect(resultado.origem.estruturadoPorIA).toBe(true);
    expect(repositorioMock.salvar).toHaveBeenCalledWith(resultado);
  });

  it("propaga squad e entregaveis do ticket", async () => {
    const caso = new PublicarOportunidade(repositorioMock);
    const resultado = await caso.executar({
      id: "op-2",
      autorId: "assessor-1",
      ticket,
      textoBruto: "Job da Natura...",
      revisadoPeloAutor: true,
    });
    expect(resultado.squad.papeis[0].funcao).toBe("Creator de beleza");
    expect(resultado.squad.papeis[0].qtd).toBe(2);
    expect(resultado.entregaveis).toContain("1 reels");
  });
});
