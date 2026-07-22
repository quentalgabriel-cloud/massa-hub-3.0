import { describe, it, expect } from "vitest";
import { Perfil } from "@dominio/perfil/Perfil";

const base = {
  id: "u-1",
  handle: "gabriel-quental",
  nome: "Gabriel Quental",
  papel: "assessor" as const,
};

describe("Perfil — no do grafo (nucleo unico, variacao por papel)", () => {
  it("cria um perfil valido e expoe o handle normalizado", () => {
    const perfil = Perfil.criar(base);
    expect(perfil.id).toBe("u-1");
    expect(perfil.nome).toBe("Gabriel Quental");
    expect(perfil.handle.valor).toBe("gabriel-quental");
    expect(perfil.papel).toBe("assessor");
  });

  it("exige id e nome", () => {
    expect(() => Perfil.criar({ ...base, id: "  " })).toThrow();
    expect(() => Perfil.criar({ ...base, nome: "  " })).toThrow();
  });

  it("recusa papel invalido", () => {
    // @ts-expect-error papel fora do tipo
    expect(() => Perfil.criar({ ...base, papel: "marca" })).toThrow();
  });

  it("valida o handle atraves do VO", () => {
    expect(() => Perfil.criar({ ...base, handle: "login" })).toThrow();
    expect(() => Perfil.criar({ ...base, handle: "ab" })).toThrow();
  });

  it("reconhece o assessor (cavalo de Troia, tag em destaque)", () => {
    expect(Perfil.criar(base).ehAssessor()).toBe(true);
    expect(Perfil.criar({ ...base, papel: "creator" }).ehAssessor()).toBe(false);
  });

  it("distingue perfil reivindicado de perfil ancorado sem dono", () => {
    expect(Perfil.criar(base).estaReivindicado()).toBe(false);
    expect(
      Perfil.criar({ ...base, usuarioId: "auth-9" }).estaReivindicado(),
    ).toBe(true);
  });

  it("normaliza tags: sem vazias, sem duplicadas, limitadas", () => {
    const perfil = Perfil.criar({
      ...base,
      tags: [" Foto ", "foto", "", "Video", "Design"],
    });
    expect(perfil.tags).toEqual(["Foto", "Video", "Design"]);
  });

  it("recusa bio longa demais", () => {
    expect(() => Perfil.criar({ ...base, bio: "x".repeat(281) })).toThrow();
  });
});
