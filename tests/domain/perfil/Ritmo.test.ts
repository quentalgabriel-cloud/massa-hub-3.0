import { describe, it, expect } from "vitest";
import { Prova } from "@dominio/prova/Prova";
import { Assinatura } from "@dominio/prova/Assinatura";
import { Ritmo } from "@dominio/perfil/Ritmo";

function prova(id: string, data: Date, verificada = true): Prova {
  let p = Prova.criar({
    id,
    tipo: "campanha",
    titulo: `Trabalho ${id}`,
    descricao: "descricao",
    criadorId: "ana",
    contratanteId: `marca-${id}`,
    data,
  }).assinar(Assinatura.criar({ autorId: "ana", papel: "criador" }));
  if (verificada) {
    p = p.assinar(
      Assinatura.criar({ autorId: `marca-${id}`, papel: "contratante" }),
    );
  }
  return p;
}

describe("Ritmo — heatmap de colaboracoes (so com volume real)", () => {
  it("agrega eventos por dia e ordena crescente", () => {
    const ritmo = Ritmo.deProvas([
      prova("a", new Date("2026-03-01T12:00:00Z")),
      prova("b", new Date("2026-03-01T20:00:00Z")),
      prova("c", new Date("2026-02-10T09:00:00Z")),
    ]);
    expect(ritmo.dias.map((d) => d.dia)).toEqual(["2026-02-10", "2026-03-01"]);
    expect(ritmo.dias[1].contagem).toBe(2);
    expect(ritmo.totalEventos).toBe(3);
  });

  it("conta apenas provas verificadas", () => {
    const ritmo = Ritmo.deProvas([
      prova("a", new Date("2026-03-01T12:00:00Z"), true),
      prova("b", new Date("2026-03-02T12:00:00Z"), false),
    ]);
    expect(ritmo.totalEventos).toBe(1);
  });

  it("nao renderiza abaixo do volume minimo (heatmap vazio comunica o oposto)", () => {
    const ritmo = Ritmo.deProvas([
      prova("a", new Date("2026-03-01T12:00:00Z")),
      prova("b", new Date("2026-03-02T12:00:00Z")),
    ]);
    expect(ritmo.deveRenderizar).toBe(false);
  });

  it("renderiza quando ha volume suficiente", () => {
    const dias = ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04"];
    const ritmo = Ritmo.deProvas(
      dias.map((d, i) => prova(String(i), new Date(`${d}T12:00:00Z`))),
    );
    expect(ritmo.deveRenderizar).toBe(true);
    expect(ritmo.totalEventos).toBe(4);
  });

  it("atribui nivel de intensidade proporcional ao dia mais ativo", () => {
    const ritmo = Ritmo.deProvas([
      prova("a", new Date("2026-03-01T10:00:00Z")),
      prova("b", new Date("2026-03-01T11:00:00Z")),
      prova("c", new Date("2026-03-01T12:00:00Z")),
      prova("d", new Date("2026-03-01T13:00:00Z")),
      prova("e", new Date("2026-03-05T13:00:00Z")),
    ]);
    const diaCheio = ritmo.dias.find((d) => d.dia === "2026-03-01");
    const diaMagro = ritmo.dias.find((d) => d.dia === "2026-03-05");
    expect(diaCheio?.nivel).toBe(4);
    expect(diaMagro?.nivel).toBe(1);
  });

  it("ritmo vazio nao renderiza", () => {
    expect(Ritmo.vazio().deveRenderizar).toBe(false);
    expect(Ritmo.deProvas([]).deveRenderizar).toBe(false);
  });
});
