import { describe, it, expect } from "vitest";
import { Prova, type DadosProva, type TipoProva } from "@dominio/prova/Prova";
import { Assinatura } from "@dominio/prova/Assinatura";

function novaProva(overrides: Partial<DadosProva> = {}): Prova {
  return Prova.criar({
    id: "prova-1",
    tipo: "campanha",
    titulo: "Campanha de verao com a Marca X",
    descricao: "Direcao criativa e producao de 3 reels.",
    criadorId: "creator-ana",
    contratanteId: "marca-x",
    ...overrides,
  });
}

const assinaturaCriador = Assinatura.criar({
  autorId: "creator-ana",
  papel: "criador",
});
const assinaturaContratante = Assinatura.criar({
  autorId: "marca-x",
  papel: "contratante",
});

describe("Prova — criacao e validacao", () => {
  it("cria uma prova valida em status em_andamento", () => {
    const prova = novaProva();
    expect(prova.status).toBe("em_andamento");
    expect(prova.estaVerificada()).toBe(false);
  });

  it("exige campos obrigatorios", () => {
    expect(() => novaProva({ titulo: "   " })).toThrow();
    expect(() => novaProva({ descricao: "" })).toThrow();
    expect(() => novaProva({ criadorId: "" })).toThrow();
    expect(() => novaProva({ contratanteId: "" })).toThrow();
  });

  it("recusa criador e contratante iguais (prova e bilateral)", () => {
    expect(() =>
      novaProva({ criadorId: "mesma", contratanteId: "mesma" }),
    ).toThrow();
  });

  it("recusa tipo invalido", () => {
    expect(() => novaProva({ tipo: "qualquer" as TipoProva })).toThrow();
  });
});

describe("Prova — verificacao bilateral (criador + contratante)", () => {
  it("sem assinaturas nao verifica", () => {
    expect(novaProva().status).toBe("em_andamento");
  });

  it("uma assinatura nao verifica", () => {
    const prova = novaProva().assinar(assinaturaCriador);
    expect(prova.status).toBe("em_andamento");
  });

  it("duas assinaturas do mesmo lado nao verificam", () => {
    const prova = novaProva()
      .assinar(assinaturaCriador)
      .assinar(Assinatura.criar({ autorId: "colaborador", papel: "criador" }));
    expect(prova.estaVerificada()).toBe(false);
  });

  it("criador + contratante verificam a prova", () => {
    const prova = novaProva()
      .assinar(assinaturaCriador)
      .assinar(assinaturaContratante);
    expect(prova.status).toBe("verificada");
    expect(prova.estaVerificada()).toBe(true);
  });

  it("nao permite o mesmo autor assinar duas vezes", () => {
    const prova = novaProva().assinar(assinaturaCriador);
    expect(() => prova.assinar(assinaturaCriador)).toThrow();
  });
});

describe("Prova — imutabilidade (AGENTS.md: nunca mutar)", () => {
  it("assinar retorna nova instancia e nao altera a original", () => {
    const original = novaProva();
    const assinada = original.assinar(assinaturaCriador);
    expect(original.assinaturas.length).toBe(0);
    expect(assinada.assinaturas.length).toBe(1);
    expect(assinada).not.toBe(original);
  });
});
