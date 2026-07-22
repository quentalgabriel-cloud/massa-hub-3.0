import { Prova } from "../prova/Prova";

// Ritmo — value object. A assinatura visual do perfil: um heatmap de colaboracoes
// ao longo do tempo, estilo contribution graph do GitHub, em escala violeta
// (docs/specs/01-reputacao-lastro.md). NAO e um score (D1) — e a contagem de
// eventos reais por dia.
//
// Regra dura da spec 01: so renderizar quando houver VOLUME real. Heatmap vazio
// comunica o oposto do pretendido. Por isso o VO carrega `deveRenderizar`: em
// perfil novo, a UI omite o Ritmo e deixa as Provas carregarem o perfil.

// Minimo de eventos para o heatmap comunicar densidade em vez de vazio.
const MINIMO_EVENTOS = 4;

// Numero de niveis de intensidade (0 = vazio; 1..4 = escala violeta do heatmap,
// espelhando --color-ritmo-1..4 em globals.css).
const NIVEIS = 4;

export interface DiaRitmo {
  // Data no formato YYYY-MM-DD (dia local, chave do bucket).
  dia: string;
  contagem: number;
  // Intensidade discreta 0..4 para mapear na escala de cor da UI.
  nivel: number;
}

export class Ritmo {
  private constructor(
    readonly dias: readonly DiaRitmo[],
    readonly totalEventos: number,
    readonly deveRenderizar: boolean,
  ) {}

  // Deriva o Ritmo das provas VERIFICADAS: cada prova confirmada pelos dois lados
  // e um evento de colaboracao na sua data. Provas em andamento nao contam — so
  // trabalho verificavel forma o Ritmo.
  static deProvas(provas: readonly Prova[]): Ritmo {
    const contagemPorDia = new Map<string, number>();
    for (const prova of provas) {
      if (!prova.estaVerificada()) continue;
      const dia = chaveDia(prova.data);
      contagemPorDia.set(dia, (contagemPorDia.get(dia) ?? 0) + 1);
    }

    const totalEventos = [...contagemPorDia.values()].reduce(
      (soma, n) => soma + n,
      0,
    );
    const maxNoDia = Math.max(0, ...contagemPorDia.values());

    const dias: DiaRitmo[] = [...contagemPorDia.entries()]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([dia, contagem]) => ({
        dia,
        contagem,
        nivel: nivelDeIntensidade(contagem, maxNoDia),
      }));

    return new Ritmo(dias, totalEventos, totalEventos >= MINIMO_EVENTOS);
  }

  static vazio(): Ritmo {
    return new Ritmo([], 0, false);
  }
}

function chaveDia(data: Date): string {
  const ano = data.getUTCFullYear();
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(data.getUTCDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// Mapeia a contagem de um dia para um dos NIVEIS degraus da escala. O dia mais
// ativo alcanca o nivel maximo; os demais escalam proporcionalmente.
function nivelDeIntensidade(contagem: number, maxNoDia: number): number {
  if (contagem <= 0 || maxNoDia <= 0) return 0;
  const proporcao = contagem / maxNoDia;
  return Math.max(1, Math.ceil(proporcao * NIVEIS));
}
