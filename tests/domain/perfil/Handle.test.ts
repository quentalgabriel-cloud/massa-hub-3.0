import { describe, it, expect } from "vitest";
import { Handle } from "@dominio/perfil/Handle";

describe("Handle — identificador publico do perfil", () => {
  it("normaliza para minusculo e apara espacos", () => {
    expect(Handle.criar("  GabrielQuental  ").valor).toBe("gabrielquental");
  });

  it("aceita letras, numeros e hifen interno", () => {
    expect(Handle.criar("ana-souza-2").valor).toBe("ana-souza-2");
  });

  it("recusa handle vazio", () => {
    expect(() => Handle.criar("   ")).toThrow();
  });

  it("recusa curto demais ou longo demais", () => {
    expect(() => Handle.criar("ab")).toThrow();
    expect(() => Handle.criar("a".repeat(31))).toThrow();
  });

  it("recusa caracteres invalidos e hifen nas pontas ou duplicado", () => {
    expect(() => Handle.criar("ana souza")).toThrow();
    expect(() => Handle.criar("ana_souza")).toThrow();
    expect(() => Handle.criar("-ana")).toThrow();
    expect(() => Handle.criar("ana-")).toThrow();
    expect(() => Handle.criar("ana--souza")).toThrow();
  });

  it("recusa nomes reservados de rota", () => {
    expect(() => Handle.criar("login")).toThrow();
    expect(() => Handle.criar("oportunidades")).toThrow();
    expect(() => Handle.criar("provas")).toThrow();
    expect(() => Handle.criar("api")).toThrow();
  });

  it("deriva um handle valido a partir de texto com acento e espaco", () => {
    expect(Handle.aPartirDeTexto("Gabriel Quental").valor).toBe(
      "gabriel-quental",
    );
    expect(Handle.aPartirDeTexto("Ana  Souza!!").valor).toBe("ana-souza");
  });

  it("compara por valor", () => {
    expect(Handle.criar("ana").igualA(Handle.criar("ANA"))).toBe(true);
    expect(Handle.criar("ana").igualA(Handle.criar("bia"))).toBe(false);
  });
});
