import { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";
import { Handle } from "@dominio/perfil/Handle";
import { Perfil, type PapelPerfil } from "@dominio/perfil/Perfil";

// Caso de uso: o claim minimo. O usuario autenticado cria ou atualiza o PROPRIO
// perfil. O perfilId e o id do usuario de auth — assim as arestas ja gravadas em
// Prova/Oportunidade (que usam o id da sessao como perfilId) passam a ter nome e
// cara. Identidade vem da sessao, nunca do cliente (ver actions server-side).
//
// Regra dura (spec 03): claim ancorado, sem perfil-fantasma. Aqui o dono cria o
// proprio no — o caso legitimo. Criacao em massa de terceiros e outra historia
// (fora de escopo, quarentena).

export interface EntradaPerfilProprio {
  usuarioId: string;
  handle: string;
  nome: string;
  papel: PapelPerfil;
  tags?: string[];
  avatarUrl?: string;
  bio?: string;
}

export class CriarOuAtualizarPerfilProprio {
  constructor(private readonly repositorio: PerfilRepositorio) {}

  async executar(entrada: EntradaPerfilProprio): Promise<Perfil> {
    const usuarioId = entrada.usuarioId?.trim();
    if (!usuarioId) {
      throw new Error("CriarOuAtualizarPerfilProprio exige usuarioId.");
    }

    // Normaliza e valida o handle antes de checar unicidade.
    const handle = Handle.criar(entrada.handle);

    const jaComEsseHandle = await this.repositorio.buscarPorHandle(handle.valor);
    if (jaComEsseHandle && jaComEsseHandle.id !== usuarioId) {
      throw new Error(`O handle @${handle.valor} ja esta em uso.`);
    }

    const perfil = Perfil.criar({
      id: usuarioId,
      usuarioId,
      handle: handle.valor,
      nome: entrada.nome,
      papel: entrada.papel,
      tags: entrada.tags,
      avatarUrl: entrada.avatarUrl,
      bio: entrada.bio,
    });

    await this.repositorio.salvar(perfil);
    return perfil;
  }
}
