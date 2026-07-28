import { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";
import { OportunidadeRepositorio } from "@dominio/ports/OportunidadeRepositorio";
import { Perfil } from "@dominio/perfil/Perfil";
import { Handle } from "@dominio/perfil/Handle";
import { Email } from "@dominio/perfil/Email";
import { Oportunidade } from "@dominio/oportunidade/Oportunidade";

// Caso de uso: o assessor traz um creator da sua rede para o squad de uma
// oportunidade real. E a porta de entrada do claim profile (spec 03) — o creator
// entra PELA oportunidade, nunca por cadastro em massa.
//
// Chaveado por handle, unifica os dois caminhos:
//   - handle ja existe  -> REUSA o perfil (creator ja esta na rede)
//   - handle nao existe -> cria um Perfil PENDENTE ancorado nesta oportunidade
// Em ambos, liga o perfil ao squad reusando Oportunidade.candidatar (o metodo
// que ja existe — nao inventamos um caminho novo de vinculo).
//
// D7: o perfil pendente nasce com origem (a oportunidade + o assessor). Sem
// ancora, Perfil.criar lanca — a regra e do dominio, nao deste caso de uso.

export interface EntradaVincularCreatorAoSquad {
  oportunidadeId: string;
  assessorId: string; // quem vincula; precisa ser o autor da oportunidade
  handle: string; // identifica o creator (reusa se ja existir)
  nome: string;
  perfilId: string; // id a usar SE um novo perfil pendente for criado
  email?: string; // contato opcional, para o convite de ativação (Fase 2)
}

export interface ResultadoVincularCreatorAoSquad {
  perfil: Perfil;
  oportunidade: Oportunidade;
  criouPerfil: boolean; // true se um perfil pendente novo foi criado
}

export class VincularCreatorAoSquad {
  constructor(
    private readonly perfis: PerfilRepositorio,
    private readonly oportunidades: OportunidadeRepositorio,
  ) {}

  async executar(
    entrada: EntradaVincularCreatorAoSquad,
  ): Promise<ResultadoVincularCreatorAoSquad> {
    const oportunidade = await this.oportunidades.buscarPorId(
      entrada.oportunidadeId,
    );
    if (!oportunidade) {
      throw new Error(
        `VincularCreatorAoSquad: oportunidade "${entrada.oportunidadeId}" nao encontrada.`,
      );
    }

    // So o autor traz a rede dele. O assessor vincula creators da SUA
    // oportunidade — nunca da de outro (spec 03).
    if (oportunidade.autorId !== entrada.assessorId) {
      throw new Error(
        "VincularCreatorAoSquad: so o autor da oportunidade pode vincular creators.",
      );
    }
    if (oportunidade.status === "fechada") {
      throw new Error(
        "VincularCreatorAoSquad: oportunidade fechada nao aceita novos vinculos.",
      );
    }

    const handle = Handle.criar(entrada.handle);
    const email = Email.criarOpcional(entrada.email);
    const existente = await this.perfis.buscarPorHandle(handle.valor);

    let perfil: Perfil;
    let criouPerfil: boolean;
    if (existente) {
      // Creator já na rede: completa o contato se ele ainda não tinha e o
      // assessor informou um agora. Nunca sobrescreve um e-mail existente —
      // o dado de quem já está na rede é dela, não de quem vincula.
      if (email && !existente.email) {
        perfil = existente.comEmail(email);
        await this.perfis.salvar(perfil);
      } else {
        perfil = existente;
      }
      criouPerfil = false;
    } else {
      perfil = Perfil.criar({
        id: entrada.perfilId,
        tipo: "creator",
        nome: entrada.nome,
        handle,
        origem: {
          oportunidadeId: oportunidade.id,
          vinculadoPorId: entrada.assessorId,
          vinculadoEm: new Date(),
        },
        email,
      });
      await this.perfis.salvar(perfil);
      criouPerfil = true;
    }

    // Liga o perfil ao squad. Idempotente na entidade — vincular duas vezes o
    // mesmo creator nao duplica a candidatura.
    const atualizada = oportunidade.candidatar(perfil.id);
    await this.oportunidades.salvar(atualizada);

    return { perfil, oportunidade: atualizada, criouPerfil };
  }
}
