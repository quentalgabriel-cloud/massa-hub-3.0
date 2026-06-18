import { describe, it, expect } from "vitest";
import {
  Oportunidade,
  type DadosOportunidade,
} from "@dominio/oportunidade/Oportunidade";
import { Squad } from "@dominio/oportunidade/Squad";
import { Papel } from "@dominio/oportunidade/Papel";

function novaOportunidade(
  overrides: Partial<DadosOportunidade> = {},
): Oportunidade {
  return Oportunidade.criar({
    id: "op-1",
    autorId: "assessor-joao",
    marca: "Natura",
    squad: Squad.de([Papel.criar({ funcao: "skincare", qtd: 5 })]),
    origem: {
      textoBruto: "job da Natura pra setembro, 5 creators do NE...",
      estruturadoPorIA: true,
      revisadoPeloAutor: true,
    },
    budget: 25000,
    regiao: "Nordeste",
    entregaveis: ["1 reels", "3 stories"],
    ...overrides,
  });
}

describe("Oportunidade — criacao e gate de revisao humana", () => {
  it("cria uma oportunidade aberta apos revisao", () => {
    const op = novaOportunidade();
    expect(op.status).toBe("aberta");
    expect(op.squad.totalPosicoes()).toBe(5);
  });

  it("NAO publica sem revisao humana (spec 02)", () => {
    expect(() =>
      novaOportunidade({
        origem: {
          textoBruto: "...",
          estruturadoPorIA: true,
          revisadoPeloAutor: false,
        },
      }),
    ).toThrow();
  });

  it("exige id, autorId e marca", () => {
    expect(() => novaOportunidade({ id: "" })).toThrow();
    expect(() => novaOportunidade({ autorId: "  " })).toThrow();
    expect(() => novaOportunidade({ marca: "" })).toThrow();
  });

  it("recusa budget negativo", () => {
    expect(() => novaOportunidade({ budget: -1 })).toThrow();
  });
});

describe("Oportunidade — transicoes de status (imutaveis)", () => {
  it("aberta -> em_selecao -> fechada", () => {
    const aberta = novaOportunidade();
    const emSelecao = aberta.iniciarSelecao();
    const fechada = emSelecao.fechar();
    expect(aberta.status).toBe("aberta");
    expect(emSelecao.status).toBe("em_selecao");
    expect(fechada.status).toBe("fechada");
  });

  it("selecao so inicia de uma oportunidade aberta", () => {
    const fechada = novaOportunidade().fechar();
    expect(() => fechada.iniciarSelecao()).toThrow();
  });
});

describe("Oportunidade — candidaturas", () => {
  it("adiciona candidatura sem mutar o original e e idempotente", () => {
    const op = novaOportunidade();
    const comCandidato = op.candidatar("creator-ana");
    expect(op.candidaturas.length).toBe(0);
    expect(comCandidato.candidaturas).toEqual(["creator-ana"]);
    expect(comCandidato.candidatar("creator-ana").candidaturas).toEqual([
      "creator-ana",
    ]);
  });

  it("oportunidade fechada nao aceita candidaturas", () => {
    const fechada = novaOportunidade().fechar();
    expect(() => fechada.candidatar("creator-ana")).toThrow();
  });
});
