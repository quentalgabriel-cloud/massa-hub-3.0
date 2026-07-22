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

describe("Handle.aPartirDe — derivacao para provisionar o assessor", () => {
  it("deriva de nome com espaco e maiuscula", () => {
    expect(Handle.aPartirDe("Gabriel Quental").valor).toBe("gabriel-quental");
  });

  it("remove acento (joão -> joao)", () => {
    expect(Handle.aPartirDe("João Silva").valor).toBe("joao-silva");
  });

  it("usa a parte antes do @ quando recebe e-mail", () => {
    expect(Handle.aPartirDe("gabi.quental@gmail.com").valor).toBe(
      "gabi-quental",
    );
  });

  it("colapsa separadores e apara hifen das bordas", () => {
    expect(Handle.aPartirDe("  --Ana   Maria!! ").valor).toBe("ana-maria");
  });

  it("trunca a 30 caracteres sem deixar hifen no fim", () => {
    const handle = Handle.aPartirDe("a".repeat(28) + " bcde");
    expect(handle.valor.length).toBeLessThanOrEqual(30);
    expect(handle.valor.endsWith("-")).toBe(false);
  });

  it("lanca quando o bruto nao tem caractere aproveitavel", () => {
    expect(() => Handle.aPartirDe("!!!")).toThrow();
    expect(() => Handle.aPartirDe("")).toThrow();
  });
});
