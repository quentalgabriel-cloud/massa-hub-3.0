import Link from "next/link";
import type { OportunidadeResumo } from "@aplicacao/ListarOportunidades";

interface Props {
  oportunidade: OportunidadeResumo;
}

function formatarBudget(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatarPrazo(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(data);
}

export function CardOportunidade({ oportunidade }: Props) {
  const {
    id,
    marca,
    totalPosicoes,
    nichos,
    regiao,
    budget,
    prazo,
    estruturadoPorIA,
    autor,
  } = oportunidade;

  return (
    <Link
      href={`/oportunidades/${id}`}
      className="group block"
      aria-label={`Ver oportunidade de ${marca}`}
    >
      <article
        className="bg-card rounded-[12px] px-5 py-4 transition-colors cursor-pointer border border-line group-hover:border-violet"
        style={{
          minHeight: "44px",
        }}
      >
        {/* Linha superior: label MARCA + budget */}
        <div className="flex items-start justify-between gap-4 mb-1">
          <span
            className="text-[10px] font-medium tracking-widest"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-ink3)",
            }}
          >
            MARCA
          </span>
          {budget !== undefined && (
            <span
              className="text-sm font-medium tabular-nums shrink-0"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-ink2)",
              }}
            >
              {formatarBudget(budget)}
            </span>
          )}
        </div>

        {/* Nome da marca */}
        <h2
          className="text-xl font-bold leading-tight mb-3"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-ink)",
            fontStretch: "condensed",
            transition: "color 0.15s",
          }}
        >
          {marca}
        </h2>

        {/* Atribuição: quem publicou (texto — o card inteiro já linka o ticket) */}
        {autor && (
          <p
            className="text-[11px] mb-3"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-ink3)",
            }}
          >
            por {autor.nome} · @{autor.handle}
          </p>
        )}

        {/* Squad: chips de nicho + posicoes */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span
            className="text-[9px] tracking-widest shrink-0"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-ink3)",
            }}
          >
            SQUAD
          </span>
          {nichos.slice(0, 4).map((nicho) => (
            <span
              key={nicho}
              className="px-2 py-0.5 text-[10px] font-medium rounded-[6px] shrink-0"
              style={{
                fontFamily: "var(--font-mono)",
                background: "var(--color-violet-soft)",
                color: "var(--color-violet-deep)",
                letterSpacing: "0.04em",
              }}
            >
              {nicho}
            </span>
          ))}
          <span
            className="ml-auto text-xs tabular-nums shrink-0"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-ink3)",
            }}
          >
            {totalPosicoes} {totalPosicoes === 1 ? "posicao" : "posicoes"}
          </span>
        </div>

        {/* Regiao + Prazo */}
        {(regiao || prazo) && (
          <div
            className="flex items-center gap-4 text-xs mb-1"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-ink3)",
            }}
          >
            {regiao && (
              <span>
                <span className="text-[9px] tracking-widest">REGIAO</span>{" "}
                {regiao}
              </span>
            )}
            {prazo && (
              <span>
                <span className="text-[9px] tracking-widest">PRAZO</span>{" "}
                {formatarPrazo(prazo)}
              </span>
            )}
          </div>
        )}

        {/* Rodape: estruturado por IA */}
        {estruturadoPorIA && (
          <p
            className="text-[10px] mt-2"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-ink3)",
            }}
          >
            Estruturado por IA · revisado
          </p>
        )}
      </article>
    </Link>
  );
}
