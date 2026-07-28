import { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";
import { OportunidadeRepositorio } from "@dominio/ports/OportunidadeRepositorio";
import { ProvaRepositorio } from "@dominio/ports/ProvaRepositorio";
import { Lastro } from "@dominio/prova/Lastro";
import type { TipoPerfil, EstadoPerfil } from "@dominio/perfil/Perfil";

// Caso de uso de LEITURA: monta a visao publica de um perfil a partir do handle
// (a pagina /handle). Devolve so FATOS contaveis (D1: Lastro, nunca score) e
// nunca campos sensiveis (usuario_id fica de fora do DTO).
//
// Dois recortes de fato, por vocabulario do dominio:
//   - Lastro (creator): derivado das provas VERIFICADAS de que o perfil e parte.
//   - Atividade (assessor): oportunidades publicadas + marcas distintas atendidas.
// Ambos sao calculados sempre; a UI mostra o recorte do `tipo`. Handle
// desconhecido => null (a rota responde 404).

export interface PerfilPublicoDTO {
  nome: string;
  handle: string;
  tipo: TipoPerfil;
  estado: EstadoPerfil;
  lastro: {
    provasVerificadas: number;
    marcasDistintas: number;
    marcasRecorrentes: number;
  };
  atividade: {
    oportunidadesPublicadas: number;
    marcasAtendidas: number;
  };
  // As oportunidades publicadas pelo perfil (assessor), leves, para tecer a
  // rede: o /handle linka para cada oportunidade. Vazio para creator.
  oportunidades: { id: string; marca: string }[];
}

export class VerPerfilPublico {
  constructor(
    private readonly perfis: PerfilRepositorio,
    private readonly oportunidades: OportunidadeRepositorio,
    private readonly provas: ProvaRepositorio,
  ) {}

  async executar(handle: string): Promise<PerfilPublicoDTO | null> {
    const chave = handle?.trim().toLowerCase();
    if (!chave) return null;

    const perfil = await this.perfis.buscarPorHandle(chave);
    if (!perfil) return null;

    const [provasDoPerfil, oportunidadesDoPerfil] = await Promise.all([
      this.provas.listarPorParte(perfil.id),
      this.oportunidades.listarPorAutor(perfil.id),
    ]);

    const lastro = Lastro.deProvas(provasDoPerfil);

    const marcasAtendidas = new Set(
      oportunidadesDoPerfil.map((o) => o.marca),
    ).size;

    return {
      nome: perfil.nome,
      handle: perfil.handle.valor,
      tipo: perfil.tipo,
      estado: perfil.estado,
      lastro: {
        provasVerificadas: lastro.nProvasVerificadas,
        marcasDistintas: lastro.marcasDistintas,
        marcasRecorrentes: lastro.marcasRecorrentes,
      },
      atividade: {
        oportunidadesPublicadas: oportunidadesDoPerfil.length,
        marcasAtendidas,
      },
      oportunidades: oportunidadesDoPerfil.map((o) => ({
        id: o.id,
        marca: o.marca,
      })),
    };
  }
}
