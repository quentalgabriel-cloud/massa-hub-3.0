import { describe, it, expect, vi } from "vitest";
import { ListarOportunidades } from "@aplicacao/ListarOportunidades";
import { Oportunidade } from "@dominio/oportunidade/Oportunidade";
import { Squad } from "@dominio/oportunidade/Squad";
import { Papel } from "@dominio/oportunidade/Papel";

function makeOp(
  id: string,
  marca: string,
  opts: { nicho?: string; regiao?: string } = {},
) {
  const squad = Squad.de([
    Papel.criar({ funcao: "Creator", qtd: 2, nicho: opts.nicho }),
  ]);
  return Oportunidade.criar({
    id,
    autorId: "assessor-1",
    marca,
    squad,
    regiao: opts.regiao,
    origem: { textoBruto: "...", estruturadoPorIA: true, revisadoPeloAutor: true },
    status: "aberta",
  });
}

const op1 = makeOp("op-1", "Natura", { nicho: "Beleza", regiao: "Nordeste" });
const op2 = makeOp("op-2", "Nike", { nicho: "Esporte", regiao: "Sul" });
const op3 = makeOp("op-3", "Ambev", { regiao: "SP" });

const repositorioMock = {
  buscarPorId: vi.fn(),
  salvar: vi.fn(),
  listarAbertas: vi.fn().mockResolvedValue([op1, op2, op3]),
  listarPorAutor: vi.fn(),
};

describe("ListarOportunidades", () => {
  it("retorna resumo de todas as oportunidades abertas", async () => {
    const caso = new ListarOportunidades(repositorioMock);
    const resultado = await caso.executar();
    expect(resultado).toHaveLength(3);
    expect(resultado[0].marca).toBe("Natura");
    expect(resultado[0].totalPosicoes).toBe(2);
  });

  it("filtra por nicho (case-insensitive)", async () => {
    const caso = new ListarOportunidades(repositorioMock);
    const resultado = await caso.executar({ filtro: { nicho: "beleza" } });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].marca).toBe("Natura");
  });

  it("filtra por regiao (match parcial)", async () => {
    const caso = new ListarOportunidades(repositorioMock);
    const resultado = await caso.executar({ filtro: { regiao: "nord" } });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].marca).toBe("Natura");
  });

  it("retorna vazio quando nenhum match", async () => {
    const caso = new ListarOportunidades(repositorioMock);
    const resultado = await caso.executar({ filtro: { nicho: "gastronomia" } });
    expect(resultado).toHaveLength(0);
  });

  it("inclui nichos unicos no resumo", async () => {
    const caso = new ListarOportunidades(repositorioMock);
    const resultado = await caso.executar();
    expect(resultado[0].nichos).toContain("Beleza");
  });
});
