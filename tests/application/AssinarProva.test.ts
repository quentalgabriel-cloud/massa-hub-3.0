import { describe, it, expect } from "vitest";
import { RegistrarProva } from "@aplicacao/RegistrarProva";
import { AssinarProva } from "@aplicacao/AssinarProva";
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
    return this.listarPorPartes([perfilId]);
  }
  async listarPorPartes(perfilIds: string[]) {
    const ids = new Set(perfilIds);
    return [...this.mapa.values()].filter(
      (p) => ids.has(p.criadorId) || ids.has(p.contratanteId),
    );
  }
}

async function provaRegistrada(repo: RepoFake) {
  return new RegistrarProva(repo).executar({
    id: "prova-1",
    tipo: "campanha",
    titulo: "Campanha de verao",
    descricao: "Producao de 3 reels",
    criadorId: "creator-ana",
    contratanteId: "marca-x",
    registranteId: "creator-ana",
    ladoRegistrante: "criador",
  });
}

describe("AssinarProva", () => {
  it("a contraparte assina e a prova vira verificada", async () => {
    const repo = new RepoFake();
    await provaRegistrada(repo);
    const assinada = await new AssinarProva(repo).executar({
      provaId: "prova-1",
      assinanteId: "marca-x",
    });
    expect(assinada.status).toBe("verificada");
    expect(assinada.estaVerificada()).toBe(true);
  });

  it("recusa quem nao e parte da prova", async () => {
    const repo = new RepoFake();
    await provaRegistrada(repo);
    await expect(
      new AssinarProva(repo).executar({
        provaId: "prova-1",
        assinanteId: "intruso",
      }),
    ).rejects.toThrow();
  });

  it("recusa a mesma parte assinar duas vezes (regra do dominio)", async () => {
    const repo = new RepoFake();
    await provaRegistrada(repo);
    await expect(
      new AssinarProva(repo).executar({
        provaId: "prova-1",
        assinanteId: "creator-ana",
      }),
    ).rejects.toThrow();
  });

  it("erra se a prova nao existe", async () => {
    const repo = new RepoFake();
    await expect(
      new AssinarProva(repo).executar({
        provaId: "inexistente",
        assinanteId: "marca-x",
      }),
    ).rejects.toThrow();
  });
});
