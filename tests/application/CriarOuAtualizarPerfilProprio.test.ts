import { describe, it, expect } from "vitest";
import { CriarOuAtualizarPerfilProprio } from "@aplicacao/CriarOuAtualizarPerfilProprio";
import { Perfil } from "@dominio/perfil/Perfil";
import type { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";

class PerfilRepoFake implements PerfilRepositorio {
  readonly mapa = new Map<string, Perfil>();
  async buscarPorId(id: string) {
    return this.mapa.get(id) ?? null;
  }
  async buscarPorHandle(handle: string) {
    return (
      [...this.mapa.values()].find((p) => p.handle.valor === handle) ?? null
    );
  }
  async buscarPorUsuario(usuarioId: string) {
    return (
      [...this.mapa.values()].find((p) => p.usuarioId === usuarioId) ?? null
    );
  }
  async salvar(p: Perfil) {
    this.mapa.set(p.id, p);
  }
  async buscar(termo: string) {
    const t = termo.toLowerCase();
    return [...this.mapa.values()].filter(
      (p) =>
        p.nome.toLowerCase().includes(t) || p.handle.valor.includes(t),
    );
  }
}

const base = {
  usuarioId: "auth-1",
  handle: "gabriel-quental",
  nome: "Gabriel Quental",
  papel: "assessor" as const,
};

describe("CriarOuAtualizarPerfilProprio — claim minimo", () => {
  it("cria o perfil do proprio usuario com perfilId = usuarioId", async () => {
    const repo = new PerfilRepoFake();
    const perfil = await new CriarOuAtualizarPerfilProprio(repo).executar(base);
    expect(perfil.id).toBe("auth-1");
    expect(perfil.usuarioId).toBe("auth-1");
    expect(perfil.estaReivindicado()).toBe(true);
    expect(repo.mapa.get("auth-1")).toBeDefined();
  });

  it("atualiza o proprio perfil (mesmo usuario, mesmo handle) sem colidir", async () => {
    const repo = new PerfilRepoFake();
    const uc = new CriarOuAtualizarPerfilProprio(repo);
    await uc.executar(base);
    const atualizado = await uc.executar({ ...base, nome: "Gabriel Q." });
    expect(atualizado.nome).toBe("Gabriel Q.");
    expect(repo.mapa.size).toBe(1);
  });

  it("recusa handle ja usado por outro usuario", async () => {
    const repo = new PerfilRepoFake();
    await new CriarOuAtualizarPerfilProprio(repo).executar(base);
    await expect(
      new CriarOuAtualizarPerfilProprio(repo).executar({
        ...base,
        usuarioId: "auth-2",
      }),
    ).rejects.toThrow(/em uso/);
  });

  it("exige usuarioId (identidade da sessao)", async () => {
    const repo = new PerfilRepoFake();
    await expect(
      new CriarOuAtualizarPerfilProprio(repo).executar({
        ...base,
        usuarioId: "  ",
      }),
    ).rejects.toThrow();
  });
});
