import { describe, it, expect } from "vitest";
import { RegistrarProva } from "@aplicacao/RegistrarProva";
import { Prova } from "@dominio/prova/Prova";
import type { ProvaRepositorio } from "@dominio/ports/ProvaRepositorio";

class RepoFake implements ProvaRepositorio {
  readonly mapa = new Map<string, Prova>();
  async buscarPorId(id: string) {
    return this.mapa.get(id) ?? null;
  }
  async salvar(p: Prova) {
    this.mapa.set(p.id, p);
  }
  async listarPorCriador(criadorId: string) {
    return [...this.mapa.values()].filter((p) => p.criadorId === criadorId);
  }
  async listarPorParte(perfilId: string) {
    return [...this.mapa.values()].filter(
      (p) => p.criadorId === perfilId || p.contratanteId === perfilId,
    );
  }
}

function entradaBase() {
  return {
    id: "prova-1",
    tipo: "campanha" as const,
    titulo: "Campanha de verao",
    descricao: "Producao de 3 reels",
    criadorId: "creator-ana",
    contratanteId: "marca-x",
  };
}

describe("RegistrarProva", () => {
  it("registra uma prova em_andamento assinada por quem registra (criador)", async () => {
    const repo = new RepoFake();
    const prova = await new RegistrarProva(repo).executar({
      ...entradaBase(),
      registranteId: "creator-ana",
      ladoRegistrante: "criador",
    });
    expect(prova.status).toBe("em_andamento");
    expect(prova.assinaturas.length).toBe(1);
    expect(repo.mapa.get("prova-1")).toBeDefined();
  });

  it("aceita o contratante como registrante", async () => {
    const repo = new RepoFake();
    const prova = await new RegistrarProva(repo).executar({
      ...entradaBase(),
      registranteId: "marca-x",
      ladoRegistrante: "contratante",
    });
    expect(prova.assinaturas[0].papel).toBe("contratante");
  });

  it("recusa registrante que nao bate com o lado declarado", async () => {
    const repo = new RepoFake();
    await expect(
      new RegistrarProva(repo).executar({
        ...entradaBase(),
        registranteId: "marca-x", // diz ser criador mas e o contratante
        ladoRegistrante: "criador",
      }),
    ).rejects.toThrow();
  });

  it("recusa criador e contratante iguais (regra do dominio)", async () => {
    const repo = new RepoFake();
    await expect(
      new RegistrarProva(repo).executar({
        ...entradaBase(),
        contratanteId: "creator-ana",
        registranteId: "creator-ana",
        ladoRegistrante: "criador",
      }),
    ).rejects.toThrow();
  });
});
