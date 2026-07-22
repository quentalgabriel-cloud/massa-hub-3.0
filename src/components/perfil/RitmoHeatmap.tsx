import type { Ritmo, DiaRitmo } from "@dominio/perfil/Ritmo";

// Ritmo — a assinatura visual do perfil. Heatmap estilo contribution graph do
// GitHub, escala violeta (tokens --color-ritmo-0..4 em globals.css). Renderiza
// as ultimas SEMANAS semanas; so e chamado quando ritmo.deveRenderizar e true
// (spec 01: heatmap vazio comunica o oposto do pretendido).

const SEMANAS = 26;
const MS_DIA = 24 * 60 * 60 * 1000;

const COR_NIVEL = [
  "var(--color-ritmo-0)",
  "var(--color-ritmo-1)",
  "var(--color-ritmo-2)",
  "var(--color-ritmo-3)",
  "var(--color-ritmo-4)",
];

function chaveDia(data: Date): string {
  const ano = data.getUTCFullYear();
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(data.getUTCDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// Monta a grade 7 x SEMANAS terminando em hoje, preenchendo os dias vazios.
function montarGrade(dias: readonly DiaRitmo[]): number[][] {
  const nivelPorDia = new Map(dias.map((d) => [d.dia, d.nivel]));

  const hoje = new Date();
  const fim = new Date(
    Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()),
  );
  // Volta ao domingo da semana atual para alinhar as colunas.
  const fimDomingo = new Date(fim.getTime() - fim.getUTCDay() * MS_DIA);
  const inicio = new Date(fimDomingo.getTime() - (SEMANAS - 1) * 7 * MS_DIA);

  const colunas: number[][] = [];
  for (let s = 0; s < SEMANAS; s++) {
    const coluna: number[] = [];
    for (let d = 0; d < 7; d++) {
      const dia = new Date(inicio.getTime() + (s * 7 + d) * MS_DIA);
      coluna.push(dia > fim ? -1 : (nivelPorDia.get(chaveDia(dia)) ?? 0));
    }
    colunas.push(coluna);
  }
  return colunas;
}

export default function RitmoHeatmap({ ritmo }: { ritmo: Ritmo }) {
  const colunas = montarGrade(ritmo.dias);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]" role="img" aria-label="Ritmo de colaboracoes">
        {colunas.map((coluna, s) => (
          <div key={s} className="flex flex-col gap-[3px]">
            {coluna.map((nivel, d) => (
              <div
                key={d}
                className="w-[11px] h-[11px] rounded-[2px]"
                style={{
                  background:
                    nivel < 0 ? "transparent" : COR_NIVEL[nivel] ?? COR_NIVEL[0],
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
