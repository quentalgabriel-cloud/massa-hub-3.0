import { describe, it, expect, vi } from "vitest";
import { ExplorarRede } from "@aplicacao/ExplorarRede";
import { Perfil } from "@dominio/perfil/Perfil";
import { Handle } from "@dominio/perfil/Handle";
import { Prova } from "@dominio/prova/Prova";
import { Assinatura } from "@dominio/prova/Assinatura";

function assessor() {
  return Perfil.criar({
    id: "perfil-gabi",
    tipo: "assessor",
    nome: "Gabriel Quental",
    handle: Handle.criar("gabriel-quental"),
    usuarioId: "user-gabi",
  });
}

function creator() {
  return Perfil.criar({
    id: "perfil-ana",
    tipo: "creator",
    nome: "Ana Beauty",
    handle: Handle.criar("anabeauty"),
    usuarioId: "user-ana",
  });
}

// Prova verificada: assinada pelas duas partes.
function provaVerificada(id: string, criador: string, contratante: string) {
  return Prova.criar({
    id,
    tipo: "campanha",
    titulo: `Campanha ${id}`,
    descricao: "trabalho real",
    criadorId: criador,
    contratanteId: contratante,
    data: new Date("2026-05-01"),
    assinaturas: [
      Assinatura.criar({ autorId: criador, papel: "criador" }),
      Assinatura.criar({ autorId: contratante, papel: "contratante" }),
    ],
  });
}

function repos(over: {
  perfis?: Perfil[];
  provas?: Prova[];
  oportunidades?: unknown[];
}) {
  const perfis = {
    buscarPorId: vi.fn(),
    buscarPorIds: vi.fn(),
    buscarPorHandle: vi.fn(),
    buscarPorUsuario: vi.fn(),
    salvar: vi.fn(),
    listarPendentesVinculadosPor: vi.fn(),
    listar: vi.fn().mockResolvedValue(over.perfis ?? []),
  };
  const provas = {
    buscarPorId: vi.fn(),
    salvar: vi.fn(),
    listarPorCriador: vi.fn(),
    listarPorParte: vi.fn(),
    listarPorPartes: vi.fn().mockResolvedValue(over.provas ?? []),
  };
  const oportunidades = {
    buscarPorId: vi.fn(),
    salvar: vi.fn(),
    listarAbertas: vi.fn(),
    listarPorAutor: vi.fn(),
    listarPorAutores: vi.fn().mockResolvedValue(over.oportunidades ?? []),
  };
  return { perfis, provas, oportunidades };
}

function montar(over: Parameters<typeof repos>[0]) {
  const r = repos(over);
  return {
    caso: new ExplorarRede(
      r.perfis as never,
      r.provas as never,
      r.oportunidades as never,
    ),
    ...r,
  };
}

describe("ExplorarRede", () => {
  it("devolve vazio sem tocar as outras consultas quando não há perfis", async () => {
    const { caso, provas, oportunidades } = montar({ perfis: [] });
    expect(await caso.executar()).toEqual([]);
    expect(provas.listarPorPartes).not.toHaveBeenCalled();
    expect(oportunidades.listarPorAutores).not.toHaveBeenCalled();
  });

  it("conta o Lastro de cada perfil a partir das provas verificadas", async () => {
    const { caso } = montar({
      perfis: [creator()],
      provas: [
        provaVerificada("pr-1", "perfil-ana", "marca-nike"),
        provaVerificada("pr-2", "perfil-ana", "marca-adidas"),
      ],
    });

    const [ana] = await caso.executar();
    expect(ana.provasVerificadas).toBe(2);
    expect(ana.marcasDistintas).toBe(2);
  });

  it("conta a atividade do assessor em UMA consulta em lote", async () => {
    const { caso, oportunidades } = montar({
      perfis: [assessor()],
      oportunidades: [
        { autorId: "perfil-gabi" },
        { autorId: "perfil-gabi" },
        { autorId: "outro" },
      ],
    });

    const [gabi] = await caso.executar();
    expect(gabi.oportunidadesPublicadas).toBe(2);
    expect(oportunidades.listarPorAutores).toHaveBeenCalledTimes(1);
    expect(oportunidades.listarPorAutores).toHaveBeenCalledWith(["perfil-gabi"]);
  });

  it("não busca oportunidades quando não há assessor no resultado", async () => {
    const { caso, oportunidades } = montar({ perfis: [creator()] });
    await caso.executar();
    expect(oportunidades.listarPorAutores).not.toHaveBeenCalled();
  });

  it("mostra zero para quem ainda não tem trabalho registrado (honesto)", async () => {
    const { caso } = montar({ perfis: [creator()] });
    const [ana] = await caso.executar();
    expect(ana.provasVerificadas).toBe(0);
    expect(ana.marcasDistintas).toBe(0);
    expect(ana.oportunidadesPublicadas).toBe(0);
  });

  it("repassa o filtro de busca ao repositório", async () => {
    const { caso, perfis } = montar({ perfis: [] });
    await caso.executar({ busca: "ana", tipo: "creator", limite: 10 });
    expect(perfis.listar).toHaveBeenCalledWith({
      busca: "ana",
      tipo: "creator",
      limite: 10,
    });
  });

  it("resolve o Lastro de várias pessoas em UMA consulta de provas", async () => {
    const { caso, provas } = montar({
      perfis: [creator(), assessor()],
      provas: [provaVerificada("pr-1", "perfil-ana", "perfil-gabi")],
    });

    const resultado = await caso.executar();
    expect(provas.listarPorPartes).toHaveBeenCalledTimes(1);
    // a mesma prova conta para as duas partes
    expect(resultado.find((p) => p.id === "perfil-ana")?.provasVerificadas).toBe(1);
    expect(resultado.find((p) => p.id === "perfil-gabi")?.provasVerificadas).toBe(1);
  });
});
