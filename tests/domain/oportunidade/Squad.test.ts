import { describe, it, expect } from "vitest";
import { Papel } from "@dominio/oportunidade/Papel";
import { Squad } from "@dominio/oportunidade/Squad";
import { FaixaSeguidores } from "@dominio/oportunidade/FaixaSeguidores";

describe("FaixaSeguidores", () => {
  it("aceita faixa fechada e faixa aberta (sem max)", () => {
    expect(FaixaSeguidores.criar(50000, 300000).max).toBe(300000);
    expect(FaixaSeguidores.criar(50000).max).toBeUndefined();
  });

  it("recusa min negativo e max menor que min", () => {
    expect(() => FaixaSeguidores.criar(-1)).toThrow();
    expect(() => FaixaSeguidores.criar(300000, 50000)).toThrow();
  });
});

describe("Papel", () => {
  it("cria papel simples (funcao + qtd)", () => {
    const papel = Papel.criar({ funcao: "beleza", qtd: 2 });
    expect(papel.funcao).toBe("beleza");
    expect(papel.qtd).toBe(2);
    expect(papel.nicho).toBeUndefined();
  });

  it("aceita nicho e faixaSeguidores opcionais (superset spec 05)", () => {
    const papel = Papel.criar({
      funcao: "lifestyle",
      qtd: 1,
      nicho: "viagem",
      faixaSeguidores: FaixaSeguidores.criar(100000, 500000),
    });
    expect(papel.nicho).toBe("viagem");
    expect(papel.faixaSeguidores?.min).toBe(100000);
  });

  it("exige funcao e qtd >= 1", () => {
    expect(() => Papel.criar({ funcao: "  ", qtd: 1 })).toThrow();
    expect(() => Papel.criar({ funcao: "beleza", qtd: 0 })).toThrow();
    expect(() => Papel.criar({ funcao: "beleza", qtd: 1.5 })).toThrow();
  });
});

describe("Squad", () => {
  it("exige ao menos um papel", () => {
    expect(() => Squad.de([])).toThrow();
  });

  it("totalPosicoes soma as quantidades dos papeis", () => {
    const squad = Squad.de([
      Papel.criar({ funcao: "beleza", qtd: 2 }),
      Papel.criar({ funcao: "lifestyle", qtd: 1 }),
    ]);
    expect(squad.papeis.length).toBe(2);
    expect(squad.totalPosicoes()).toBe(3);
  });
});
