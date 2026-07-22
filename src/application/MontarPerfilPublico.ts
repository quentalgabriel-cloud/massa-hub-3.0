import { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";
import { ProvaRepositorio } from "@dominio/ports/ProvaRepositorio";
import { Perfil } from "@dominio/perfil/Perfil";
import { Prova } from "@dominio/prova/Prova";
import { Lastro } from "@dominio/prova/Lastro";
import { Ritmo } from "@dominio/perfil/Ritmo";

// Caso de uso: monta a pagina publica /<handle>. Agrega o perfil com as suas
// Provas, o Lastro (fatos contaveis, nunca score — D1) e o Ritmo (heatmap, so
// com volume real — spec 01). E o cerebro por tras da leitura de um perfil.

export interface PerfilPublico {
  perfil: Perfil;
  // Provas verificadas, mais recentes primeiro — as que "vendem" a pessoa.
  provasEmDestaque: Prova[];
  lastro: Lastro;
  ritmo: Ritmo;
}

export class MontarPerfilPublico {
  constructor(
    private readonly perfilRepositorio: PerfilRepositorio,
    private readonly provaRepositorio: ProvaRepositorio,
  ) {}

  async executar(handle: string): Promise<PerfilPublico | null> {
    const alvo = (handle ?? "").trim().toLowerCase();
    if (!alvo) return null;

    const perfil = await this.perfilRepositorio.buscarPorHandle(alvo);
    if (!perfil) return null;

    const provas = await this.provaRepositorio.listarPorParte(perfil.id);

    const provasEmDestaque = provas
      .filter((p) => p.estaVerificada())
      .sort((a, b) => b.data.getTime() - a.data.getTime());

    return {
      perfil,
      provasEmDestaque,
      lastro: Lastro.deProvas(provas),
      ritmo: Ritmo.deProvas(provas),
    };
  }
}
