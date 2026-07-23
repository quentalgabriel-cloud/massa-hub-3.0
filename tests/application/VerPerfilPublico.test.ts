import { describe, it, expect, vi } from "vitest";
import { VerPerfilPublico } from "@aplicacao/VerPerfilPublico";
import { Perfil } from "@dominio/perfil/Perfil";
import { Handle } from "@dominio/perfil/Handle";

function assessor() {
  return Perfil.criar({
    id: "perfil-gabi",
    tipo: "assessor",
    nome: "Gabriel Quental",
    handle: Handle.criar("gabriel-quental"),
    usuarioId: "user-gabi",
  });
}

function creator() {
  return Perfil.criar({
    id: "perfil-ana",
    tipo: "creator",
    nome: "Ana Beauty",
    handle: Handle.criar("anabeauty"),
    usuarioId: "user-ana",
  });
}

// Oportunidade fake minima: so o que VerPerfilPublico le (id + marca).
function op(id: string, marca: string) {
  return { id, marca } as unknown as import("@dominio/oportunidade/Oportunidade").Oportunidade;
}

function repos(over: {
  perfil?: Perfil | null;
  oportunidades?: unknown[];
  provas?: unknown[];
}) {
  const perfis = {
    buscarPorId: vi.fn(),
    buscarPorHandle: vi.fn().mockResolvedValue(over.perfil ?? null),
    buscarPorUsuario: vi.fn(),
    salvar: vi.fn(),
    listarPendentesVinculadosPor: vi.fn(),
  };
  const oportunidades = {
    buscarPorId: vi.fn(),
    salvar: vi.fn(),
    listarAbertas: vi.fn(),
    listarPorAutor: vi.fn().mockResolvedValue(over.oportunidades ?? []),
  };
  const provas = {
    buscarPorId: vi.fn(),
    salvar: vi.fn(),
    listarPorCriador: vi.fn(),
    listarPorParte: vi.fn().mockResolvedValue(over.provas ?? []),
  };
  return { perfis, oportunidades, provas };
}

describe("VerPerfilPublico", () => {
  it("retorna null quando o handle nao existe", async () => {
    const { perfis, oportunidades, provas } = repos({ perfil: null });
    const caso = new VerPerfilPublico(
      perfis as never,
      oportunidades as never,
      provas as never,
    );
    expect(await caso.executar("ninguem")).toBeNull();
  });

  it("retorna null para handle vazio sem tocar o repositorio", async () => {
    const { perfis, oportunidades, provas } = repos({});
    const caso = new VerPerfilPublico(
      perfis as never,
      oportunidades as never,
      provas as never,
    );
    expect(await caso.executar("   ")).toBeNull();
    expect(perfis.buscarPorHandle).not.toHaveBeenCalled();
  });

  it("normaliza o handle para minusculo antes de buscar", async () => {
    const { perfis, oportunidades, provas } = repos({ perfil: assessor() });
    const caso = new VerPerfilPublico(
      perfis as never,
      oportunidades as never,
      provas as never,
    );
    await caso.executar("Gabriel-Quental");
    expect(perfis.buscarPorHandle).toHaveBeenCalledWith("gabriel-quental");
  });

  it("conta atividade do assessor (oportunidades + marcas distintas)", async () => {
    const { perfis, oportunidades, provas } = repos({
      perfil: assessor(),
      oportunidades: [op("op-1", "Nike"), op("op-2", "Adidas"), op("op-3", "Nike")],
    });
    const caso = new VerPerfilPublico(
      perfis as never,
      oportunidades as never,
      provas as never,
    );
    const dto = await caso.executar("gabriel-quental");
    expect(dto?.tipo).toBe("assessor");
    expect(dto?.atividade.oportunidadesPublicadas).toBe(3);
    expect(dto?.atividade.marcasAtendidas).toBe(2); // Nike, Adidas
    expect(dto?.oportunidades).toEqual([
      { id: "op-1", marca: "Nike" },
      { id: "op-2", marca: "Adidas" },
      { id: "op-3", marca: "Nike" },
    ]);
    expect(dto).not.toHaveProperty("usuarioId"); // DTO nao vaza id de auth
  });

  it("zera os fatos quando nao ha lastro nem atividade", async () => {
    const { perfis, oportunidades, provas } = repos({ perfil: creator() });
    const caso = new VerPerfilPublico(
      perfis as never,
      oportunidades as never,
      provas as never,
    );
    const dto = await caso.executar("anabeauty");
    expect(dto?.lastro.provasVerificadas).toBe(0);
    expect(dto?.atividade.oportunidadesPublicadas).toBe(0);
  });
});
