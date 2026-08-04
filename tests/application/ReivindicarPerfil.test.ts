import { describe, it, expect, vi } from "vitest";
import { ReivindicarPerfil } from "@aplicacao/ReivindicarPerfil";
import { Perfil } from "@dominio/perfil/Perfil";
import { Handle } from "@dominio/perfil/Handle";

function perfilPendente(): Perfil {
  return Perfil.criar({
    id: "perfil-ana",
    tipo: "creator",
    nome: "Ana Beauty",
    handle: Handle.criar("anabeauty"),
    origem: {
      oportunidadeId: "op-1",
      vinculadoPorId: "assessor-gabi",
      vinculadoEm: new Date("2026-09-01"),
    },
  });
}

function perfisMock(overrides: Record<string, unknown> = {}) {
  return {
    buscarPorId: vi.fn().mockResolvedValue(perfilPendente()),
    buscarPorIds: vi.fn().mockResolvedValue([]),
    buscarPorHandle: vi.fn(),
    buscarPorUsuario: vi.fn().mockResolvedValue(null),
    salvar: vi.fn().mockResolvedValue(undefined),
    listarPendentesVinculadosPor: vi.fn(),
    listar: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe("ReivindicarPerfil", () => {
  it("reivindica o perfil pendente e salva, preservando a origem", async () => {
    const perfis = perfisMock();
    const caso = new ReivindicarPerfil(perfis);

    const resultado = await caso.executar({
      perfilId: "perfil-ana",
      usuarioId: "user-ana",
    });

    expect(resultado.estado).toBe("reivindicado");
    expect(resultado.usuarioId).toBe("user-ana");
    expect(resultado.origem?.oportunidadeId).toBe("op-1");
    expect(perfis.salvar).toHaveBeenCalledWith(resultado);
  });

  it("exige usuarioId da sessao", async () => {
    const caso = new ReivindicarPerfil(perfisMock());
    await expect(
      caso.executar({ perfilId: "perfil-ana", usuarioId: "  " }),
    ).rejects.toThrow("usuarioId");
  });

  it("lanca se o perfil nao existe", async () => {
    const perfis = perfisMock({ buscarPorId: vi.fn().mockResolvedValue(null) });
    const caso = new ReivindicarPerfil(perfis);
    await expect(
      caso.executar({ perfilId: "nao-existe", usuarioId: "user-ana" }),
    ).rejects.toThrow("nao encontrado");
  });

  it("impede um usuario de ter dois perfis", async () => {
    const outro = Perfil.criar({
      id: "perfil-outro",
      tipo: "assessor",
      nome: "Outro",
      handle: Handle.criar("outro"),
      usuarioId: "user-ana",
    });
    const perfis = perfisMock({
      buscarPorUsuario: vi.fn().mockResolvedValue(outro),
    });
    const caso = new ReivindicarPerfil(perfis);
    await expect(
      caso.executar({ perfilId: "perfil-ana", usuarioId: "user-ana" }),
    ).rejects.toThrow("ja possui o perfil");
  });

  it("recusa reivindicar um perfil ja reivindicado", async () => {
    const jaReivindicado = Perfil.criar({
      id: "perfil-ana",
      tipo: "creator",
      nome: "Ana Beauty",
      handle: Handle.criar("anabeauty"),
      usuarioId: "user-ana",
    });
    const perfis = perfisMock({
      buscarPorId: vi.fn().mockResolvedValue(jaReivindicado),
      buscarPorUsuario: vi.fn().mockResolvedValue(null),
    });
    const caso = new ReivindicarPerfil(perfis);
    await expect(
      caso.executar({ perfilId: "perfil-ana", usuarioId: "user-bia" }),
    ).rejects.toThrow("ja reivindicado");
  });
});
