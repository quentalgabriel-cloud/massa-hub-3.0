import { describe, it, expect, vi } from "vitest";
import { VincularCreatorAoSquad } from "@aplicacao/VincularCreatorAoSquad";
import { Oportunidade } from "@dominio/oportunidade/Oportunidade";
import { Squad } from "@dominio/oportunidade/Squad";
import { Papel } from "@dominio/oportunidade/Papel";
import { Perfil } from "@dominio/perfil/Perfil";
import { Handle } from "@dominio/perfil/Handle";

const squad = Squad.de([Papel.criar({ funcao: "Creator", qtd: 2 })]);

function novaOportunidade(
  overrides: Partial<Parameters<typeof Oportunidade.criar>[0]> = {},
): Oportunidade {
  return Oportunidade.criar({
    id: "op-1",
    autorId: "assessor-gabi",
    marca: "Natura",
    squad,
    origem: { textoBruto: "...", estruturadoPorIA: true, revisadoPeloAutor: true },
    status: "aberta",
    ...overrides,
  });
}

function perfisMock(overrides: Record<string, unknown> = {}) {
  return {
    buscarPorId: vi.fn(),
    buscarPorIds: vi.fn().mockResolvedValue([]),
    buscarPorHandle: vi.fn().mockResolvedValue(null),
    buscarPorUsuario: vi.fn(),
    salvar: vi.fn().mockResolvedValue(undefined),
    listarPendentesVinculadosPor: vi.fn(),
    ...overrides,
  };
}

function oportunidadesMock(op: Oportunidade | null) {
  return {
    buscarPorId: vi.fn().mockResolvedValue(op),
    salvar: vi.fn().mockResolvedValue(undefined),
    listarAbertas: vi.fn(),
    listarPorAutor: vi.fn(),
  };
}

const entradaBase = {
  oportunidadeId: "op-1",
  assessorId: "assessor-gabi",
  handle: "anabeauty",
  nome: "Ana Beauty",
  perfilId: "perfil-ana",
};

describe("VincularCreatorAoSquad — creator novo", () => {
  it("cria perfil pendente ancorado e o liga ao squad", async () => {
    const perfis = perfisMock();
    const oportunidades = oportunidadesMock(novaOportunidade());
    const caso = new VincularCreatorAoSquad(perfis, oportunidades);

    const resultado = await caso.executar(entradaBase);

    expect(resultado.criouPerfil).toBe(true);
    expect(resultado.perfil.estado).toBe("pendente");
    expect(resultado.perfil.origem?.oportunidadeId).toBe("op-1");
    expect(resultado.perfil.origem?.vinculadoPorId).toBe("assessor-gabi");
    expect(perfis.salvar).toHaveBeenCalledWith(resultado.perfil);
    expect(resultado.oportunidade.candidaturas).toContain("perfil-ana");
    expect(oportunidades.salvar).toHaveBeenCalledWith(resultado.oportunidade);
  });
});

describe("VincularCreatorAoSquad — creator ja existente", () => {
  it("reusa o perfil existente (nao cria outro) e liga ao squad", async () => {
    const existente = Perfil.criar({
      id: "perfil-ja-existe",
      tipo: "creator",
      nome: "Ana Beauty",
      handle: Handle.criar("anabeauty"),
      usuarioId: "user-ana",
    });
    const perfis = perfisMock({
      buscarPorHandle: vi.fn().mockResolvedValue(existente),
    });
    const oportunidades = oportunidadesMock(novaOportunidade());
    const caso = new VincularCreatorAoSquad(perfis, oportunidades);

    const resultado = await caso.executar(entradaBase);

    expect(resultado.criouPerfil).toBe(false);
    expect(resultado.perfil.id).toBe("perfil-ja-existe");
    expect(perfis.salvar).not.toHaveBeenCalled();
    expect(resultado.oportunidade.candidaturas).toContain("perfil-ja-existe");
  });
});

describe("VincularCreatorAoSquad — autorizacao e estado", () => {
  it("lanca se a oportunidade nao existe", async () => {
    const caso = new VincularCreatorAoSquad(
      perfisMock(),
      oportunidadesMock(null),
    );
    await expect(caso.executar(entradaBase)).rejects.toThrow("nao encontrada");
  });

  it("so o autor da oportunidade pode vincular", async () => {
    const caso = new VincularCreatorAoSquad(
      perfisMock(),
      oportunidadesMock(novaOportunidade()),
    );
    await expect(
      caso.executar({ ...entradaBase, assessorId: "outro-assessor" }),
    ).rejects.toThrow("so o autor");
  });

  it("nao vincula em oportunidade fechada", async () => {
    const caso = new VincularCreatorAoSquad(
      perfisMock(),
      oportunidadesMock(novaOportunidade({ status: "fechada" })),
    );
    await expect(caso.executar(entradaBase)).rejects.toThrow("fechada");
  });
});
