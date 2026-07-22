import { describe, it, expect } from "vitest";
import { Handle } from "@dominio/perfil/Handle";

describe("Handle — normalizacao e validacao", () => {
  it("normaliza para minusculo e sem espaco nas bordas", () => {
    expect(Handle.criar("  GabiQuental ").valor).toBe("gabiquental");
  });

  it("aceita letras, numeros e hifen", () => {
    expect(Handle.criar("ana-maria-99").valor).toBe("ana-maria-99");
  });

  it("exige valor", () => {
    expect(() => Handle.criar("   ")).toThrow();
    expect(() => Handle.criar("")).toThrow();
  });

  it("recusa curto demais e longo demais", () => {
    expect(() => Handle.criar("a")).toThrow();
    expect(() => Handle.criar("a".repeat(31))).toThrow();
  });

  it("recusa caracteres fora de [a-z0-9-]", () => {
    expect(() => Handle.criar("ana maria")).toThrow();
    expect(() => Handle.criar("joão")).toThrow();
    expect(() => Handle.criar("ana@hub")).toThrow();
  });

  it("recusa hifen no inicio ou fim", () => {
    expect(() => Handle.criar("-ana")).toThrow();
    expect(() => Handle.criar("ana-")).toThrow();
  });

  it("compara por valor (equals)", () => {
    expect(Handle.criar("Ana").equals(Handle.criar("ana"))).toBe(true);
    expect(Handle.criar("ana").equals(Handle.criar("beto"))).toBe(false);
  });
});
