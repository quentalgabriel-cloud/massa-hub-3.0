import { OportunidadeRepositorio } from "@dominio/ports/OportunidadeRepositorio";
import { PerfilRepositorio } from "@dominio/ports/PerfilRepositorio";

// Caso de uso: lista oportunidades abertas com filtragem em memória.
// Filtragem in-memory e suficiente para ~20-50 oportunidades (Fase 1).
// Enriquece cada resumo com o autor (perfil) para tecer a rede na listagem —
// resolvido em UMA query em lote (buscarPorIds), nunca N+1.

export interface EntradaListarOportunidades {
  filtro?: {
    nicho?: string;
    regiao?: string;
  };
  limite?: number;
}

export interface OportunidadeResumo {
  id: string;
  marca: string;
  totalPosicoes: number;
  nichos: string[];
  regiao: string | undefined;
  budget: number | undefined;
  prazo: Date | undefined;
  estruturadoPorIA: boolean;
  // Quem publicou — link para o /handle. undefined se o autor não tem nó.
  autor: { handle: string; nome: string } | undefined;
}

export class ListarOportunidades {
  constructor(
    private readonly repositorio: OportunidadeRepositorio,
    private readonly perfis: PerfilRepositorio,
  ) {}

  async executar(
    entrada: EntradaListarOportunidades = {},
  ): Promise<OportunidadeResumo[]> {
    const oportunidades = await this.repositorio.listarAbertas(
      entrada.limite ?? 50,
    );

    const { nicho, regiao } = entrada.filtro ?? {};

    const filtradas = oportunidades.filter((op) => {
      if (nicho) {
        const termo = nicho.toLowerCase();
        const temNicho = op.squad.papeis.some(
          (p) => p.nicho?.toLowerCase().includes(termo),
        );
        if (!temNicho) return false;
      }
      if (regiao) {
        const termo = regiao.toLowerCase();
        if (!op.regiao?.toLowerCase().includes(termo)) return false;
      }
      return true;
    });

    // Resolve os autores em UMA query (ids distintos) e indexa por perfilId.
    const autorIds = [...new Set(filtradas.map((op) => op.autorId))];
    const autores = await this.perfis.buscarPorIds(autorIds);
    const autorPorId = new Map(autores.map((a) => [a.id, a]));

    return filtradas.map((op) => {
      const autor = autorPorId.get(op.autorId);
      return {
        id: op.id,
        marca: op.marca,
        totalPosicoes: op.squad.totalPosicoes(),
        nichos: op.squad.papeis
          .map((p) => p.nicho)
          .filter((n): n is string => !!n),
        regiao: op.regiao,
        budget: op.budget,
        prazo: op.prazo,
        estruturadoPorIA: op.origem.estruturadoPorIA,
        autor: autor
          ? { handle: autor.handle.valor, nome: autor.nome }
          : undefined,
      };
    });
  }
}
