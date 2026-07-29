import { describe, it, expect, vi } from "vitest";
import {
  ResolverPerfis,
  ErroSemPerfilNaRede,
  ErroHandleNaoEncontrado,
} from "@aplicacao/ResolverPerfis";
import { Perfil } from "@dominio/perfil/Perfil";
import { Handle } from "@dominio/perfil/Handle";

function creatorAna() {
  return Perfil.criar({
    id: "perfil-ana",
    tipo: "creator",
    nome: "Ana Beauty",
    handle: Handle.criar("anabeauty"),
    usuarioId: "user-ana",
  });
}

function perfisMock(over: Record<string, unknown> = {}) {
  return {
    buscarPorId: vi.fn(),
    buscarPorIds: vi.fn().mockResolvedValue([]),
    buscarPorHandle: vi.fn().mockResolvedValue(null),
    buscarPorUsuario: vi.fn().mockResolvedValue(null),
    salvar: vi.fn(),
    listarPendentesVinculadosPor: vi.fn(),
    listar: vi.fn().mockResolvedValue([]),
    ...over,
  };
}

describe("ResolverPerfis.doUsuario", () => {
  it("devolve o perfil do usuario logado", async () => {
    const perfis = perfisMock({
      buscarPorUsuario: vi.fn().mockResolvedValue(creatorAna()),
    });
    const perfil = await new ResolverPerfis(perfis).doUsuario("user-ana");
    expect(perfil.id).toBe("perfil-ana");
  });

  it("lanca erro orientador quando o usuario nao tem no na rede", async () => {
    const caso = new ResolverPerfis(perfisMock());
    await expect(caso.doUsuario("user-sem-perfil")).rejects.toThrow(
      ErroSemPerfilNaRede,
    );
  });
});

describe("ResolverPerfis.porHandle", () => {
  it("resolve pelo handle publico", async () => {
    const perfis = perfisMock({
      buscarPorHandle: vi.fn().mockResolvedValue(creatorAna()),
    });
    const perfil = await new ResolverPerfis(perfis).porHandle("anabeauty");
    expect(perfil.id).toBe("perfil-ana");
    expect(perfis.buscarPorHandle).toHaveBeenCalledWith("anabeauty");
  });

  it("aceita o handle com @ na frente e normaliza", async () => {
    const perfis = perfisMock({
      buscarPorHandle: vi.fn().mockResolvedValue(creatorAna()),
    });
    await new ResolverPerfis(perfis).porHandle("@AnaBeauty");
    expect(perfis.buscarPorHandle).toHaveBeenCalledWith("anabeauty");
  });

  it("lanca quando ninguem na rede tem esse handle", async () => {
    const caso = new ResolverPerfis(perfisMock());
    await expect(caso.porHandle("fantasma")).rejects.toThrow(
      ErroHandleNaoEncontrado,
    );
  });

  it("propaga a validacao de handle invalido (dominio)", async () => {
    const caso = new ResolverPerfis(perfisMock());
    await expect(caso.porHandle("a")).rejects.toThrow();
  });
});
