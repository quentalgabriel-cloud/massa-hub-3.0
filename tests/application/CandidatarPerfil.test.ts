import { describe, it, expect, vi } from "vitest";
import { CandidatarPerfil } from "@aplicacao/CandidatarPerfil";
import { Oportunidade } from "@dominio/oportunidade/Oportunidade";
import { Squad } from "@dominio/oportunidade/Squad";
import { Papel } from "@dominio/oportunidade/Papel";

const squad = Squad.de([Papel.criar({ funcao: "Creator", qtd: 1 })]);

const opAberta = Oportunidade.criar({
  id: "op-1",
  autorId: "assessor-1",
  marca: "Natura",
  squad,
  origem: { textoBruto: "...", estruturadoPorIA: true, revisadoPeloAutor: true },
  status: "aberta",
});

const opFechada = Oportunidade.criar({
  id: "op-2",
  autorId: "assessor-1",
  marca: "Nike",
  squad,
  origem: { textoBruto: "...", estruturadoPorIA: true, revisadoPeloAutor: true },
  status: "fechada",
});

describe("CandidatarPerfil", () => {
  it("registra candidatura, salva e retorna oportunidade atualizada", async () => {
    const repositorioMock = {
      buscarPorId: vi.fn().mockResolvedValue(opAberta),
      salvar: vi.fn().mockResolvedValue(undefined),
      listarAbertas: vi.fn(),
      listarPorAutor: vi.fn(),
    };
    const caso = new CandidatarPerfil(repositorioMock);
    const resultado = await caso.executar({
      oportunidadeId: "op-1",
      perfilId: "creator-42",
    });
    expect(resultado.candidaturas).toContain("creator-42");
    expect(repositorioMock.salvar).toHaveBeenCalledWith(resultado);
  });

  it("lanca erro se oportunidade nao encontrada", async () => {
    const repositorioMock = {
      buscarPorId: vi.fn().mockResolvedValue(null),
      salvar: vi.fn(),
      listarAbertas: vi.fn(),
      listarPorAutor: vi.fn(),
    };
    const caso = new CandidatarPerfil(repositorioMock);
    await expect(
      caso.executar({ oportunidadeId: "nao-existe", perfilId: "creator-1" }),
    ).rejects.toThrow("nao encontrada");
  });

  it("lanca erro se oportunidade nao esta aberta", async () => {
    const repositorioMock = {
      buscarPorId: vi.fn().mockResolvedValue(opFechada),
      salvar: vi.fn(),
      listarAbertas: vi.fn(),
      listarPorAutor: vi.fn(),
    };
    const caso = new CandidatarPerfil(repositorioMock);
    await expect(
      caso.executar({ oportunidadeId: "op-2", perfilId: "creator-1" }),
    ).rejects.toThrow("nao esta aberta");
  });
});
