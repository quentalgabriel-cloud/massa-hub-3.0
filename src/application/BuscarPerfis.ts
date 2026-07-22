import { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";
import { Perfil } from "@dominio/perfil/Perfil";

// Caso de uso: diretorio. Busca perfis por nome ou handle para escolher a
// contraparte de uma Prova ou um candidato de Oportunidade por NOME, em vez de
// colar UUID cru (a lacuna deixada pelo Ciclo 6a). Nao lista a base inteira: sem
// termo util, devolve vazio — o diretorio e para encontrar alguem, nao vitrine.

const TERMO_MIN = 2;
const LIMITE_PADRAO = 10;

export class BuscarPerfis {
  constructor(private readonly repositorio: PerfilRepositorio) {}

  async executar(termo: string, limite = LIMITE_PADRAO): Promise<Perfil[]> {
    const alvo = (termo ?? "").trim();
    if (alvo.length < TERMO_MIN) return [];
    const teto = Number.isInteger(limite) && limite > 0 ? limite : LIMITE_PADRAO;
    return this.repositorio.buscar(alvo, teto);
  }
}
