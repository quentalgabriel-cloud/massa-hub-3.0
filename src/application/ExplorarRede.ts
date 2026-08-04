import {
  PerfilRepositorio,
  FiltroPerfis,
} from "@dominio/ports/PerfilRepositorio";
import { ProvaRepositorio } from "@dominio/ports/ProvaRepositorio";
import { OportunidadeRepositorio } from "@dominio/ports/OportunidadeRepositorio";
import { Lastro } from "@dominio/prova/Lastro";
import type { TipoPerfil, EstadoPerfil } from "@dominio/perfil/Perfil";

// Caso de uso: encontrar quem está na rede.
//
// NÃO é diretório/vitrine (CLAUDE.md §2 — camada commodity, indefensável). A
// diferença está no que se mostra: cada pessoa aparece com os FATOS do seu
// trabalho (provas verificadas, marcas, oportunidades), nunca com bio bonita
// ou score. Quem não tem trabalho registrado aparece sem número — e isso é
// informação honesta, não um defeito a esconder.
//
// Custo: 3 consultas no total, independentemente de quantos perfis voltem —
// perfis, provas em lote e oportunidades em lote. Nunca N+1.

export interface PerfilNaRede {
  id: string;
  nome: string;
  handle: string;
  tipo: TipoPerfil;
  estado: EstadoPerfil;
  provasVerificadas: number;
  marcasDistintas: number;
  oportunidadesPublicadas: number;
}

export class ExplorarRede {
  constructor(
    private readonly perfis: PerfilRepositorio,
    private readonly provas: ProvaRepositorio,
    private readonly oportunidades: OportunidadeRepositorio,
  ) {}

  async executar(filtro: FiltroPerfis = {}): Promise<PerfilNaRede[]> {
    const perfis = await this.perfis.listar(filtro);
    if (perfis.length === 0) return [];

    const ids = perfis.map((p) => p.id);

    // Provas de todos de uma vez; a contagem por pessoa sai do domínio
    // (Lastro.deProvas), para "só prova verificada conta" viver num lugar só.
    const todasAsProvas = await this.provas.listarPorPartes(ids);
    const provasPorPerfil = new Map<string, typeof todasAsProvas>();
    for (const prova of todasAsProvas) {
      for (const parte of [prova.criadorId, prova.contratanteId]) {
        if (!provasPorPerfil.has(parte)) provasPorPerfil.set(parte, []);
        provasPorPerfil.get(parte)!.push(prova);
      }
    }

    // Atividade do assessor: uma consulta para todos, e só se houver assessor.
    const assessores = perfis.filter((p) => p.tipo === "assessor");
    const opsPorAutor = new Map<string, number>();
    if (assessores.length > 0) {
      const ops = await this.oportunidades.listarPorAutores(
        assessores.map((a) => a.id),
      );
      for (const op of ops) {
        opsPorAutor.set(op.autorId, (opsPorAutor.get(op.autorId) ?? 0) + 1);
      }
    }

    return perfis.map((perfil) => {
      const lastro = Lastro.deProvas(provasPorPerfil.get(perfil.id) ?? []);
      return {
        id: perfil.id,
        nome: perfil.nome,
        handle: perfil.handle.valor,
        tipo: perfil.tipo,
        estado: perfil.estado,
        provasVerificadas: lastro.nProvasVerificadas,
        marcasDistintas: lastro.marcasDistintas,
        oportunidadesPublicadas: opsPorAutor.get(perfil.id) ?? 0,
      };
    });
  }
}
