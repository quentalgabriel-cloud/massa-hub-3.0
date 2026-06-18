import { describe, it, expect } from "vitest";
import { Prova } from "@dominio/prova/Prova";
import { Assinatura } from "@dominio/prova/Assinatura";
import { Lastro } from "@dominio/prova/Lastro";

function provaVerificada(
  id: string,
  criadorId: string,
  contratanteId: string,
): Prova {
  return Prova.criar({
    id,
    tipo: "campanha",
    titulo: `Trabalho ${id}`,
    descricao: "descricao",
    criadorId,
    contratanteId,
  })
    .assinar(Assinatura.criar({ autorId: criadorId, papel: "criador" }))
    .assinar(Assinatura.criar({ autorId: contratanteId, papel: "contratante" }));
}

function provaEmAndamento(
  id: string,
  criadorId: string,
  contratanteId: string,
): Prova {
  return Prova.criar({
    id,
    tipo: "campanha",
    titulo: `Trabalho ${id}`,
    descricao: "descricao",
    criadorId,
    contratanteId,
  }).assinar(Assinatura.criar({ autorId: criadorId, papel: "criador" }));
}

describe("Lastro — agregado de fatos contaveis (nunca score)", () => {
  it("conta apenas provas verificadas", () => {
    const lastro = Lastro.deProvas([
      provaVerificada("p1", "ana", "marca-x"),
      provaEmAndamento("p2", "ana", "marca-y"),
    ]);
    expect(lastro.nProvasVerificadas).toBe(1);
  });

  it("conta marcas distintas e recorrentes", () => {
    const lastro = Lastro.deProvas([
      provaVerificada("p1", "ana", "marca-x"),
      provaVerificada("p2", "ana", "marca-x"), // marca-x volta -> recorrente
      provaVerificada("p3", "ana", "marca-y"),
    ]);
    expect(lastro.nProvasVerificadas).toBe(3);
    expect(lastro.marcasDistintas).toBe(2);
    expect(lastro.marcasRecorrentes).toBe(1);
  });

  it("incorpora recomendacoes como fato externo contado a parte", () => {
    const lastro = Lastro.deProvas(
      [provaVerificada("p1", "ana", "marca-x")],
      4,
    );
    expect(lastro.nRecomendacoes).toBe(4);
  });

  it("recusa nRecomendacoes invalido", () => {
    expect(() => Lastro.deProvas([], -1)).toThrow();
    expect(() => Lastro.deProvas([], 1.5)).toThrow();
  });

  it("lastro vazio e zero em tudo", () => {
    const lastro = Lastro.vazio();
    expect(lastro.nProvasVerificadas).toBe(0);
    expect(lastro.marcasDistintas).toBe(0);
    expect(lastro.marcasRecorrentes).toBe(0);
    expect(lastro.nRecomendacoes).toBe(0);
  });

  it("nao expoe nenhum score — apenas os 4 fatos contaveis (D1)", () => {
    const lastro = Lastro.deProvas([provaVerificada("p1", "ana", "marca-x")], 2);
    expect(Object.keys(lastro).sort()).toEqual(
      [
        "marcasDistintas",
        "marcasRecorrentes",
        "nProvasVerificadas",
        "nRecomendacoes",
      ].sort(),
    );
  });
});
