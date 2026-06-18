import { OportunidadeRepositorio } from "@dominio/ports/OportunidadeRepositorio";

// Caso de uso: lista oportunidades abertas com filtragem em memória.
// Filtragem in-memory e suficiente para ~20-50 oportunidades (Fase 1).

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
}

export class ListarOportunidades {
  constructor(private readonly repositorio: OportunidadeRepositorio) {}

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

    return filtradas.map((op) => ({
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
    }));
  }
}
