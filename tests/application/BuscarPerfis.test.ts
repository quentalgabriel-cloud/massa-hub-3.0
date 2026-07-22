import { describe, it, expect } from "vitest";
import { BuscarPerfis } from "@aplicacao/BuscarPerfis";
import { Perfil } from "@dominio/perfil/Perfil";
import type { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";

class PerfilRepoFake implements PerfilRepositorio {
  readonly mapa = new Map<string, Perfil>();
  ultimoLimite = 0;
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
  async buscar(termo: string, limite = 10) {
    this.ultimoLimite = limite;
    const t = termo.toLowerCase();
    return [...this.mapa.values()]
      .filter(
        (p) => p.nome.toLowerCase().includes(t) || p.handle.valor.includes(t),
      )
      .slice(0, limite);
  }
}

function perfil(id: string, handle: string, nome: string): Perfil {
  return Perfil.criar({ id, handle, nome, papel: "creator" });
}

describe("BuscarPerfis — diretorio (buscar por nome, nao UUID)", () => {
  it("devolve vazio para termo curto demais (nao vitrine)", async () => {
    const repo = new PerfilRepoFake();
    await repo.salvar(perfil("1", "ana-souza", "Ana Souza"));
    expect(await new BuscarPerfis(repo).executar("a")).toEqual([]);
    expect(await new BuscarPerfis(repo).executar("  ")).toEqual([]);
  });

  it("encontra por nome ou handle", async () => {
    const repo = new PerfilRepoFake();
    await repo.salvar(perfil("1", "ana-souza", "Ana Souza"));
    await repo.salvar(perfil("2", "bia-lima", "Bia Lima"));
    const achados = await new BuscarPerfis(repo).executar("ana");
    expect(achados.map((p) => p.id)).toEqual(["1"]);
  });

  it("repassa um limite saneado ao repositorio", async () => {
    const repo = new PerfilRepoFake();
    await repo.salvar(perfil("1", "ana-souza", "Ana Souza"));
    await new BuscarPerfis(repo).executar("ana", -5);
    expect(repo.ultimoLimite).toBe(10);
  });
});
