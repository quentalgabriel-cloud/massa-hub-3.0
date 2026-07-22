import { describe, it, expect } from "vitest";
import { MontarPerfilPublico } from "@aplicacao/MontarPerfilPublico";
import { Perfil } from "@dominio/perfil/Perfil";
import { Prova } from "@dominio/prova/Prova";
import { Assinatura } from "@dominio/prova/Assinatura";
import type { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";
import type { ProvaRepositorio } from "@dominio/ports/ProvaRepositorio";

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
  async buscar() {
    return [...this.mapa.values()];
  }
}

class ProvaRepoFake implements ProvaRepositorio {
  constructor(private readonly provas: Prova[]) {}
  async buscarPorId(id: string) {
    return this.provas.find((p) => p.id === id) ?? null;
  }
  async salvar() {}
  async listarPorCriador(criadorId: string) {
    return this.provas.filter((p) => p.criadorId === criadorId);
  }
  async listarPorParte(perfilId: string) {
    return this.provas.filter(
      (p) => p.criadorId === perfilId || p.contratanteId === perfilId,
    );
  }
}

function provaVerificada(id: string, data: Date): Prova {
  return Prova.criar({
    id,
    tipo: "campanha",
    titulo: `Trabalho ${id}`,
    descricao: "descricao",
    criadorId: "perfil-ana",
    contratanteId: `marca-${id}`,
    data,
  })
    .assinar(Assinatura.criar({ autorId: "perfil-ana", papel: "criador" }))
    .assinar(Assinatura.criar({ autorId: `marca-${id}`, papel: "contratante" }));
}

const ana = Perfil.criar({
  id: "perfil-ana",
  usuarioId: "perfil-ana",
  handle: "ana-souza",
  nome: "Ana Souza",
  papel: "creator",
});

describe("MontarPerfilPublico — agrega perfil + provas + lastro + ritmo", () => {
  it("retorna null para handle inexistente", async () => {
    const uc = new MontarPerfilPublico(new PerfilRepoFake(), new ProvaRepoFake([]));
    expect(await uc.executar("ninguem")).toBeNull();
  });

  it("agrega provas em destaque (verificadas, mais recentes primeiro)", async () => {
    const perfilRepo = new PerfilRepoFake();
    await perfilRepo.salvar(ana);
    const provaRepo = new ProvaRepoFake([
      provaVerificada("a", new Date("2026-01-10T12:00:00Z")),
      provaVerificada("b", new Date("2026-05-10T12:00:00Z")),
    ]);

    const publico = await new MontarPerfilPublico(perfilRepo, provaRepo).executar(
      "ana-souza",
    );
    expect(publico).not.toBeNull();
    expect(publico!.provasEmDestaque.map((p) => p.id)).toEqual(["b", "a"]);
    expect(publico!.lastro.nProvasVerificadas).toBe(2);
  });

  it("perfil novo sem volume: ritmo nao renderiza, lastro zerado", async () => {
    const perfilRepo = new PerfilRepoFake();
    await perfilRepo.salvar(ana);
    const publico = await new MontarPerfilPublico(
      perfilRepo,
      new ProvaRepoFake([]),
    ).executar("ana-souza");
    expect(publico!.ritmo.deveRenderizar).toBe(false);
    expect(publico!.lastro.nProvasVerificadas).toBe(0);
    expect(publico!.provasEmDestaque).toEqual([]);
  });
});
