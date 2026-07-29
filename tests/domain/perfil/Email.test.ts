import { describe, it, expect } from "vitest";
import { Email } from "@dominio/perfil/Email";

describe("Email — normalizacao e validacao", () => {
  it("normaliza para minusculo e apara espacos", () => {
    expect(Email.criar("  Ana@Marca.COM  ").valor).toBe("ana@marca.com");
  });

  it("aceita subdominio e sinais comuns", () => {
    expect(Email.criar("ana.beauty+massa@mail.marca.com.br").valor).toBe(
      "ana.beauty+massa@mail.marca.com.br",
    );
  });

  it("exige valor", () => {
    expect(() => Email.criar("")).toThrow();
    expect(() => Email.criar("   ")).toThrow();
  });

  it("recusa endereco sem @ ou sem dominio com ponto", () => {
    expect(() => Email.criar("anamarca.com")).toThrow();
    expect(() => Email.criar("ana@marca")).toThrow();
    expect(() => Email.criar("@marca.com")).toThrow();
    expect(() => Email.criar("ana@.com")).toThrow();
  });

  it("recusa espacos no meio", () => {
    expect(() => Email.criar("ana @marca.com")).toThrow();
  });

  it("recusa endereco longo demais", () => {
    expect(() => Email.criar("a".repeat(250) + "@marca.com")).toThrow();
  });

  it("criarOpcional devolve undefined para vazio e Email para valor", () => {
    expect(Email.criarOpcional(undefined)).toBeUndefined();
    expect(Email.criarOpcional("  ")).toBeUndefined();
    expect(Email.criarOpcional("ana@marca.com")?.valor).toBe("ana@marca.com");
  });

  it("compara por valor", () => {
    expect(Email.criar("Ana@Marca.com").equals(Email.criar("ana@marca.com"))).toBe(
      true,
    );
  });
});
