import { describe, it, expect } from "vitest";
import { Perfil, type DadosPerfil } from "@dominio/perfil/Perfil";
import { Handle } from "@dominio/perfil/Handle";

const origemValida = {
  oportunidadeId: "op-natura-set",
  vinculadoPorId: "assessor-gabi",
  vinculadoEm: new Date("2026-09-01"),
};

function perfilReivindicado(overrides: Partial<DadosPerfil> = {}): Perfil {
  return Perfil.criar({
    id: "perfil-1",
    tipo: "assessor",
    nome: "Gabi Quental",
    handle: Handle.criar("gabiquental"),
    usuarioId: "user-gabi",
    ...overrides,
  });
}

function perfilPendente(overrides: Partial<DadosPerfil> = {}): Perfil {
  return Perfil.criar({
    id: "perfil-creator-1",
    tipo: "creator",
    nome: "Ana Beauty",
    handle: Handle.criar("anabeauty"),
    origem: origemValida,
    ...overrides,
  });
}

describe("Perfil — criacao e validacao", () => {
  it("cria perfil reivindicado quando ha usuarioId", () => {
    const perfil = perfilReivindicado();
    expect(perfil.estado).toBe("reivindicado");
    expect(perfil.usuarioId).toBe("user-gabi");
    expect(perfil.estaPendente()).toBe(false);
  });

  it("cria perfil pendente ancorado numa oportunidade", () => {
    const perfil = perfilPendente();
    expect(perfil.estado).toBe("pendente");
    expect(perfil.usuarioId).toBeUndefined();
    expect(perfil.origem?.oportunidadeId).toBe("op-natura-set");
  });

  it("exige campos obrigatorios", () => {
    expect(() => perfilReivindicado({ id: "  " })).toThrow();
    expect(() => perfilReivindicado({ nome: "" })).toThrow();
  });

  it("recusa tipo invalido", () => {
    expect(() =>
      perfilReivindicado({ tipo: "marca" as DadosPerfil["tipo"] }),
    ).toThrow();
  });
});

describe("Perfil — D7: nao existe perfil pendente sem ancora de trabalho", () => {
  it("recusa perfil pendente sem origem", () => {
    expect(() =>
      Perfil.criar({
        id: "fantasma",
        tipo: "creator",
        nome: "Perfil Fantasma",
        handle: Handle.criar("fantasma"),
      }),
    ).toThrow(/origem/i);
  });

  it("recusa origem incompleta (sem oportunidadeId ou sem quem vinculou)", () => {
    expect(() =>
      perfilPendente({
        origem: { ...origemValida, oportunidadeId: "  " },
      }),
    ).toThrow();
    expect(() =>
      perfilPendente({
        origem: { ...origemValida, vinculadoPorId: "" },
      }),
    ).toThrow();
  });

  it("recusa perfil pendente que ja carrega usuarioId", () => {
    expect(() =>
      Perfil.criar({
        id: "incoerente",
        tipo: "creator",
        nome: "Incoerente",
        handle: Handle.criar("incoerente"),
        estado: "pendente",
        usuarioId: "user-x",
        origem: origemValida,
      }),
    ).toThrow();
  });

  it("recusa perfil reivindicado sem usuarioId", () => {
    expect(() =>
      Perfil.criar({
        id: "sem-user",
        tipo: "assessor",
        nome: "Sem User",
        handle: Handle.criar("semuser"),
        estado: "reivindicado",
      }),
    ).toThrow(/usuarioId/i);
  });
});

describe("Perfil — reivindicacao (a pessoa assume o perfil pendente)", () => {
  it("pendente vira reivindicado preservando a origem (primeira oportunidade)", () => {
    const pendente = perfilPendente();
    const reivindicado = pendente.reivindicar("user-ana");
    expect(reivindicado.estado).toBe("reivindicado");
    expect(reivindicado.usuarioId).toBe("user-ana");
    expect(reivindicado.origem?.oportunidadeId).toBe("op-natura-set");
  });

  it("exige usuarioId ao reivindicar", () => {
    expect(() => perfilPendente().reivindicar("  ")).toThrow();
  });

  it("recusa reivindicar um perfil ja reivindicado", () => {
    expect(() => perfilReivindicado().reivindicar("outro-user")).toThrow();
  });

  it("e imutavel: reivindicar retorna nova instancia sem alterar a original", () => {
    const pendente = perfilPendente();
    const reivindicado = pendente.reivindicar("user-ana");
    expect(pendente.estado).toBe("pendente");
    expect(pendente.usuarioId).toBeUndefined();
    expect(reivindicado).not.toBe(pendente);
  });
});
