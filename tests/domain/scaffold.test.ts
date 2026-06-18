import { describe, it, expect } from "vitest";

// Teste-fumaca: confirma que o runner de dominio roda sem banco e sem rede.
// Sera substituido pelos testes reais de Prova/Lastro no Ciclo 1 (PROMPT 3).
describe("scaffold do dominio", () => {
  it("roda em ambiente node puro, sem dependencias externas", () => {
    expect(1 + 1).toBe(2);
  });
});
