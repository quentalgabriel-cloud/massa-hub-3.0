import { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";
import { Perfil } from "@dominio/perfil/Perfil";
import { Handle } from "@dominio/perfil/Handle";

// Resolução de identidade para o Motor da Prova.
//
// A Prova é entre NÓS DA REDE (perfilId), nunca entre ids de auth — senão o
// Lastro nunca aparece no /handle (que lê provas por perfil.id). Este módulo é
// a ponte: sessão -> perfil, e @handle -> perfil.
//
// Não cria perfil aqui: um nó nasce do trabalho (publicar oportunidade como
// assessor, reivindicar um vínculo como creator) — nunca de um cadastro solto
// (D7). Quando não existe, o erro diz o que fazer.

export class ErroSemPerfilNaRede extends Error {
  constructor() {
    super(
      "Você ainda não tem um perfil na rede. Publique uma oportunidade ou " +
        "reivindique o vínculo que um assessor abriu para você.",
    );
    this.name = "ErroSemPerfilNaRede";
  }
}

export class ErroHandleNaoEncontrado extends Error {
  constructor(handle: string) {
    super(
      `Ninguém na rede com o handle "@${handle}". A outra parte precisa estar ` +
        "na rede — vincule-a a uma oportunidade primeiro.",
    );
    this.name = "ErroHandleNaoEncontrado";
  }
}

export class ResolverPerfis {
  constructor(private readonly perfis: PerfilRepositorio) {}

  // O nó do usuário logado. Lança se ele ainda não tem um.
  async doUsuario(usuarioId: string): Promise<Perfil> {
    const perfil = await this.perfis.buscarPorUsuario(usuarioId);
    if (!perfil) throw new ErroSemPerfilNaRede();
    return perfil;
  }

  // O nó de outra pessoa, pelo identificador público (@handle).
  async porHandle(handleBruto: string): Promise<Perfil> {
    const handle = Handle.criar(handleBruto.replace(/^@/, ""));
    const perfil = await this.perfis.buscarPorHandle(handle.valor);
    if (!perfil) throw new ErroHandleNaoEncontrado(handle.valor);
    return perfil;
  }
}
