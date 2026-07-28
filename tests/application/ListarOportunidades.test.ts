import { describe, it, expect, vi } from "vitest";
import { ListarOportunidades } from "@aplicacao/ListarOportunidades";
import { Oportunidade } from "@dominio/oportunidade/Oportunidade";
import { Squad } from "@dominio/oportunidade/Squad";
import { Papel } from "@dominio/oportunidade/Papel";
import { Perfil } from "@dominio/perfil/Perfil";
import { Handle } from "@dominio/perfil/Handle";

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

const assessor1 = Perfil.criar({
  id: "assessor-1",
  tipo: "assessor",
  nome: "Gabriel Quental",
  handle: Handle.criar("gabriel-quental"),
  usuarioId: "user-gabi",
});

function perfisMock(over: Record<string, unknown> = {}) {
  return {
    buscarPorId: vi.fn(),
    buscarPorIds: vi.fn().mockResolvedValue([assessor1]),
    buscarPorHandle: vi.fn(),
    buscarPorUsuario: vi.fn(),
    salvar: vi.fn(),
    listarPendentesVinculadosPor: vi.fn(),
    ...over,
  };
}

describe("ListarOportunidades", () => {
  it("retorna resumo de todas as oportunidades abertas", async () => {
    const caso = new ListarOportunidades(repositorioMock, perfisMock());
    const resultado = await caso.executar();
    expect(resultado).toHaveLength(3);
    expect(resultado[0].marca).toBe("Natura");
    expect(resultado[0].totalPosicoes).toBe(2);
  });

  it("filtra por nicho (case-insensitive)", async () => {
    const caso = new ListarOportunidades(repositorioMock, perfisMock());
    const resultado = await caso.executar({ filtro: { nicho: "beleza" } });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].marca).toBe("Natura");
  });

  it("filtra por regiao (match parcial)", async () => {
    const caso = new ListarOportunidades(repositorioMock, perfisMock());
    const resultado = await caso.executar({ filtro: { regiao: "nord" } });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].marca).toBe("Natura");
  });

  it("retorna vazio quando nenhum match", async () => {
    const caso = new ListarOportunidades(repositorioMock, perfisMock());
    const resultado = await caso.executar({ filtro: { nicho: "gastronomia" } });
    expect(resultado).toHaveLength(0);
  });

  it("inclui nichos unicos no resumo", async () => {
    const caso = new ListarOportunidades(repositorioMock, perfisMock());
    const resultado = await caso.executar();
    expect(resultado[0].nichos).toContain("Beleza");
  });

  it("enriquece o resumo com o autor (rede), em uma unica query em lote", async () => {
    const perfis = perfisMock();
    const caso = new ListarOportunidades(repositorioMock, perfis);
    const resultado = await caso.executar();

    expect(resultado[0].autor).toEqual({
      handle: "gabriel-quental",
      nome: "Gabriel Quental",
    });
    // ids distintos: as 3 ops sao do mesmo autor -> uma chamada, um id.
    expect(perfis.buscarPorIds).toHaveBeenCalledTimes(1);
    expect(perfis.buscarPorIds).toHaveBeenCalledWith(["assessor-1"]);
  });

  it("deixa autor undefined quando o perfil do autor nao existe", async () => {
    const caso = new ListarOportunidades(
      repositorioMock,
      perfisMock({ buscarPorIds: vi.fn().mockResolvedValue([]) }),
    );
    const resultado = await caso.executar();
    expect(resultado[0].autor).toBeUndefined();
  });
});
