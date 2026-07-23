import { describe, it, expect, vi } from "vitest";
import { GarantirPerfilDoAssessor } from "@aplicacao/GarantirPerfilDoAssessor";
import { Perfil } from "@dominio/perfil/Perfil";
import { Handle } from "@dominio/perfil/Handle";

function perfisMock(overrides: Record<string, unknown> = {}) {
  return {
    buscarPorId: vi.fn(),
    buscarPorIds: vi.fn().mockResolvedValue([]),
    buscarPorHandle: vi.fn().mockResolvedValue(null),
    buscarPorUsuario: vi.fn().mockResolvedValue(null),
    salvar: vi.fn().mockResolvedValue(undefined),
    listarPendentesVinculadosPor: vi.fn(),
    ...overrides,
  };
}

const entradaBase = {
  usuarioId: "user-gabi",
  nome: "Gabriel Quental",
  email: "gabi.quental@gmail.com",
  perfilId: "perfil-novo",
};

describe("GarantirPerfilDoAssessor", () => {
  it("cria um perfil assessor reivindicado no primeiro uso", async () => {
    const perfis = perfisMock();
    const caso = new GarantirPerfilDoAssessor(perfis);

    const perfil = await caso.executar(entradaBase);

    expect(perfil.tipo).toBe("assessor");
    expect(perfil.estado).toBe("reivindicado");
    expect(perfil.usuarioId).toBe("user-gabi");
    expect(perfil.handle.valor).toBe("gabriel-quental");
    expect(perfil.origem).toBeUndefined(); // reivindicado nao tem ancora
    expect(perfis.salvar).toHaveBeenCalledWith(perfil);
  });

  it("e idempotente: se o usuario ja tem perfil, retorna sem criar", async () => {
    const existente = Perfil.criar({
      id: "perfil-existente",
      tipo: "assessor",
      nome: "Gabriel",
      handle: Handle.criar("gabriel"),
      usuarioId: "user-gabi",
    });
    const perfis = perfisMock({
      buscarPorUsuario: vi.fn().mockResolvedValue(existente),
    });
    const caso = new GarantirPerfilDoAssessor(perfis);

    const perfil = await caso.executar(entradaBase);

    expect(perfil).toBe(existente);
    expect(perfis.salvar).not.toHaveBeenCalled();
  });

  it("desambigua o handle por sufixo quando a base ja existe", async () => {
    // gabriel-quental ocupado; gabriel-quental-2 livre.
    const buscarPorHandle = vi
      .fn()
      .mockResolvedValueOnce({ id: "outro" }) // gabriel-quental
      .mockResolvedValueOnce(null); // gabriel-quental-2
    const perfis = perfisMock({ buscarPorHandle });
    const caso = new GarantirPerfilDoAssessor(perfis);

    const perfil = await caso.executar(entradaBase);

    expect(perfil.handle.valor).toBe("gabriel-quental-2");
  });

  it("exige usuarioId da sessao", async () => {
    const caso = new GarantirPerfilDoAssessor(perfisMock());
    await expect(
      caso.executar({ ...entradaBase, usuarioId: "   " }),
    ).rejects.toThrow("usuarioId");
  });

  it("deriva handle do e-mail quando o nome nao e slug-avel, mas preserva o nome de exibicao", async () => {
    const perfis = perfisMock();
    const caso = new GarantirPerfilDoAssessor(perfis);

    const perfil = await caso.executar({
      ...entradaBase,
      nome: "!!!",
      email: "contato@marca.com",
    });

    // handle precisa ser slug-safe -> cai para o e-mail
    expect(perfil.handle.valor).toBe("contato");
    // nome de exibicao e o que o provedor deu (nao-vazio) -> preservado
    expect(perfil.nome).toBe("!!!");
  });

  it("usa 'assessor' como ultimo recurso de handle", async () => {
    const perfis = perfisMock();
    const caso = new GarantirPerfilDoAssessor(perfis);

    const perfil = await caso.executar({
      usuarioId: "user-x",
      nome: "   ",
      email: undefined,
      perfilId: "perfil-x",
    });

    expect(perfil.handle.valor).toBe("assessor");
    expect(perfil.nome).toBe("Assessor");
  });
});
