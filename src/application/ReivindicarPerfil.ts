import { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";
import { Perfil } from "@dominio/perfil/Perfil";

// Caso de uso: a pessoa real assume um perfil que um assessor deixou pendente.
// O usuarioId vem SEMPRE da sessao de auth no servidor, nunca do cliente
// (mesmo cuidado de identidade do Ciclo 5). A transicao e do dominio
// (Perfil.reivindicar); aqui ficam as regras de vizinhanca:
//   - o perfil precisa existir;
//   - um mesmo usuario nao pode ter dois perfis (uma identidade, um no).

export interface EntradaReivindicarPerfil {
  perfilId: string;
  usuarioId: string; // da sessao de auth (server-side)
}

export class ReivindicarPerfil {
  constructor(private readonly perfis: PerfilRepositorio) {}

  async executar(entrada: EntradaReivindicarPerfil): Promise<Perfil> {
    const usuarioId = entrada.usuarioId?.trim();
    if (!usuarioId) {
      throw new Error("ReivindicarPerfil: usuarioId da sessao e obrigatorio.");
    }

    const perfil = await this.perfis.buscarPorId(entrada.perfilId);
    if (!perfil) {
      throw new Error(
        `ReivindicarPerfil: perfil "${entrada.perfilId}" nao encontrado.`,
      );
    }

    // Uma identidade, um no: se o usuario ja reivindicou outro perfil, nao
    // pode assumir mais um.
    const jaTem = await this.perfis.buscarPorUsuario(usuarioId);
    if (jaTem && jaTem.id !== perfil.id) {
      throw new Error(
        `ReivindicarPerfil: usuario ja possui o perfil "${jaTem.id}".`,
      );
    }

    // reivindicar() lanca se o perfil ja estiver reivindicado (regra do dominio).
    const reivindicado = perfil.reivindicar(usuarioId);
    await this.perfis.salvar(reivindicado);
    return reivindicado;
  }
}
