import { OportunidadeRepositorio } from "@dominio/ports/OportunidadeRepositorio";
import { Oportunidade } from "@dominio/oportunidade/Oportunidade";

// Caso de uso: registra a candidatura de um perfil a uma oportunidade aberta.
// A regra de negocio (status, idempotencia) vive na entidade Oportunidade.

export interface EntradaCandidatarPerfil {
  oportunidadeId: string;
  perfilId: string;
}

export class CandidatarPerfil {
  constructor(private readonly repositorio: OportunidadeRepositorio) {}

  async executar(entrada: EntradaCandidatarPerfil): Promise<Oportunidade> {
    const oportunidade = await this.repositorio.buscarPorId(
      entrada.oportunidadeId,
    );
    if (!oportunidade) {
      throw new Error(
        `CandidatarPerfil: oportunidade "${entrada.oportunidadeId}" nao encontrada.`,
      );
    }
    if (oportunidade.status !== "aberta") {
      throw new Error(
        `CandidatarPerfil: oportunidade "${entrada.oportunidadeId}" nao esta aberta (status: ${oportunidade.status}).`,
      );
    }
    const atualizada = oportunidade.candidatar(entrada.perfilId);
    await this.repositorio.salvar(atualizada);
    return atualizada;
  }
}
