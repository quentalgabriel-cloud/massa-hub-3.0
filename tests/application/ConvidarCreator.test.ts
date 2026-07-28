import { describe, it, expect, vi } from "vitest";
import {
  ConvidarCreator,
  ErroPerfilNaoEncontradoParaConvite,
  ErroConviteNaoAutorizado,
  ErroPerfilJaAtivo,
  ErroSemEmailParaConvite,
} from "@aplicacao/ConvidarCreator";
import { Perfil } from "@dominio/perfil/Perfil";
import { Handle } from "@dominio/perfil/Handle";
import { Email } from "@dominio/perfil/Email";

const ASSESSOR = "perfil-gabi";

function pendente(comEmail = true) {
  return Perfil.criar({
    id: "perfil-ana",
    tipo: "creator",
    nome: "Ana Beauty",
    handle: Handle.criar("anabeauty"),
    origem: {
      oportunidadeId: "op-1",
      vinculadoPorId: ASSESSOR,
      vinculadoEm: new Date("2026-07-01"),
    },
    email: comEmail ? Email.criar("ana@marca.com") : undefined,
  });
}

function perfisMock(perfil: Perfil | null, over: Record<string, unknown> = {}) {
  return {
    buscarPorId: vi.fn().mockResolvedValue(perfil),
    buscarPorIds: vi.fn().mockResolvedValue([]),
    buscarPorHandle: vi.fn(),
    buscarPorUsuario: vi.fn(),
    salvar: vi.fn().mockResolvedValue(undefined),
    listarPendentesVinculadosPor: vi.fn(),
    ...over,
  };
}

function emailMock(enviado = true, motivo?: string) {
  return { enviar: vi.fn().mockResolvedValue({ enviado, motivo }) };
}

const base = {
  perfilId: "perfil-ana",
  assessorId: ASSESSOR,
  urlBase: "https://massa-hub-3-0.vercel.app",
};

describe("ConvidarCreator", () => {
  it("envia o convite com o link de reivindicação do perfil", async () => {
    const email = emailMock();
    const caso = new ConvidarCreator(perfisMock(pendente()) as never, email);

    const saida = await caso.executar(base);

    expect(saida.enviado).toBe(true);
    expect(saida.destinatario).toBe("ana@marca.com");
    expect(saida.linkReivindicacao).toBe(
      "https://massa-hub-3-0.vercel.app/reivindicar/perfil-ana",
    );
    const msg = email.enviar.mock.calls[0][0];
    expect(msg.para).toBe("ana@marca.com");
    expect(msg.texto).toContain("/reivindicar/perfil-ana");
    expect(msg.assunto).toContain("Ana Beauty");
  });

  it("não duplica barra quando a urlBase termina com /", async () => {
    const caso = new ConvidarCreator(perfisMock(pendente()) as never, emailMock());
    const saida = await caso.executar({ ...base, urlBase: "https://massa.com/" });
    expect(saida.linkReivindicacao).toBe("https://massa.com/reivindicar/perfil-ana");
  });

  it("falha de envio NÃO lança — devolve motivo (o vínculo já é fato)", async () => {
    const caso = new ConvidarCreator(
      perfisMock(pendente()) as never,
      emailMock(false, "provedor indisponivel"),
    );
    const saida = await caso.executar(base);
    expect(saida.enviado).toBe(false);
    expect(saida.motivo).toBe("provedor indisponivel");
    // o link continua servindo para envio manual
    expect(saida.linkReivindicacao).toContain("/reivindicar/");
  });

  it("aceita e-mail alternativo e o guarda quando o perfil não tinha", async () => {
    const perfis = perfisMock(pendente(false));
    const caso = new ConvidarCreator(perfis as never, emailMock());

    const saida = await caso.executar({
      ...base,
      emailAlternativo: "Contato@Agencia.com",
    });

    expect(saida.destinatario).toBe("contato@agencia.com");
    expect(perfis.salvar).toHaveBeenCalledTimes(1);
    const salvo = perfis.salvar.mock.calls[0][0] as Perfil;
    expect(salvo.email?.valor).toBe("contato@agencia.com");
    expect(salvo.estaPendente()).toBe(true); // convite não ativa o perfil
  });

  it("não regrava quando o perfil já tinha e-mail", async () => {
    const perfis = perfisMock(pendente());
    await new ConvidarCreator(perfis as never, emailMock()).executar(base);
    expect(perfis.salvar).not.toHaveBeenCalled();
  });

  it("recusa quem não vinculou a pessoa", async () => {
    const caso = new ConvidarCreator(perfisMock(pendente()) as never, emailMock());
    await expect(
      caso.executar({ ...base, assessorId: "outro-assessor" }),
    ).rejects.toThrow(ErroConviteNaoAutorizado);
  });

  it("recusa perfil já reivindicado", async () => {
    const ativo = Perfil.criar({
      id: "perfil-ana",
      tipo: "creator",
      nome: "Ana Beauty",
      handle: Handle.criar("anabeauty"),
      usuarioId: "user-ana",
    });
    const caso = new ConvidarCreator(perfisMock(ativo) as never, emailMock());
    await expect(caso.executar(base)).rejects.toThrow(ErroPerfilJaAtivo);
  });

  it("recusa perfil inexistente", async () => {
    const caso = new ConvidarCreator(perfisMock(null) as never, emailMock());
    await expect(caso.executar(base)).rejects.toThrow(
      ErroPerfilNaoEncontradoParaConvite,
    );
  });

  it("orienta quando não há e-mail nem alternativo", async () => {
    const caso = new ConvidarCreator(
      perfisMock(pendente(false)) as never,
      emailMock(),
    );
    await expect(caso.executar(base)).rejects.toThrow(ErroSemEmailParaConvite);
  });
});
