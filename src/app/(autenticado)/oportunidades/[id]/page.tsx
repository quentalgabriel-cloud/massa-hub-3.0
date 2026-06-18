import type { Metadata } from "next";
import Link from "next/link";
import { OportunidadeRepositorioSupabase } from "@infra/supabase/OportunidadeRepositorioSupabase";
import BotaoCandidatura from "./BotaoCandidatura";

export const metadata: Metadata = {
  title: "Oportunidade — Massa Hub",
};

function formatarBudget(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatarData(d: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

function formatarFaixa(min: number, max?: number) {
  const fmt = (n: number) => (n >= 1000 ? `${n / 1000}k` : String(n));
  return max !== undefined ? `${fmt(min)}–${fmt(max)} segs` : `${fmt(min)}+ segs`;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-xs px-2 py-0.5 rounded-[6px]"
      style={{
        background: "var(--color-violet-soft)",
        color: "var(--color-violet-deep)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {children}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs font-medium tracking-widest uppercase block mb-1"
      style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}

function Divisor() {
  return <hr style={{ borderColor: "var(--color-line)" }} />;
}

export default async function DetalheOportunidadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repositorio = new OportunidadeRepositorioSupabase();
  const op = await repositorio.buscarPorId(id);

  if (!op) {
    return (
      <main
        className="min-h-screen px-4 py-10"
        style={{ background: "var(--color-paper)" }}
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <Link
            href="/oportunidades"
            className="text-sm"
            style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
          >
            ← Voltar
          </Link>
          <p style={{ color: "var(--color-ink2)" }}>Oportunidade nao encontrada.</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Voltar */}
        <Link
          href="/oportunidades"
          className="text-sm self-start"
          style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
        >
          ← Oportunidades
        </Link>

        {/* Cabeçalho */}
        <div>
          <Label>Marca</Label>
          <h1
            className="text-4xl font-black leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontStretch: "condensed",
              color: "var(--color-ink)",
            }}
          >
            {op.marca}
          </h1>
        </div>

        <Divisor />

        {/* Squad */}
        <div>
          <Label>Squad · {op.squad.totalPosicoes()} posições</Label>
          <div className="flex flex-col gap-2 mt-1">
            {op.squad.papeis.map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}
              >
                <span
                  className="rounded px-1.5 py-0.5 text-xs font-semibold shrink-0"
                  style={{
                    background: "var(--color-violet-soft)",
                    color: "var(--color-violet-deep)",
                    minWidth: "1.5rem",
                    textAlign: "center",
                  }}
                >
                  {p.qtd}
                </span>
                <span>
                  {p.funcao}
                  {p.nicho && (
                    <span style={{ color: "var(--color-ink3)" }}> · {p.nicho}</span>
                  )}
                  {p.faixaSeguidores && (
                    <span style={{ color: "var(--color-ink3)" }}>
                      {" "}· {formatarFaixa(p.faixaSeguidores.min, p.faixaSeguidores.max)}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metadados */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}
        >
          {op.budget !== undefined && (
            <div>
              <Label>Budget</Label>
              <span
                className="text-sm"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}
              >
                {formatarBudget(op.budget)}
              </span>
            </div>
          )}
          {op.prazo && (
            <div>
              <Label>Prazo</Label>
              <span
                className="text-sm"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}
              >
                {formatarData(op.prazo)}
              </span>
            </div>
          )}
          {op.local && (
            <div>
              <Label>Local</Label>
              <span
                className="text-sm"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}
              >
                {op.local}
              </span>
            </div>
          )}
          {op.regiao && (
            <div>
              <Label>Regiao</Label>
              <span
                className="text-sm"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}
              >
                {op.regiao}
              </span>
            </div>
          )}
        </div>

        {/* Entregáveis */}
        {op.entregaveis.length > 0 && (
          <div>
            <Label>Entregaveis</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {op.entregaveis.map((e, i) => (
                <Chip key={i}>{e}</Chip>
              ))}
            </div>
          </div>
        )}

        <Divisor />

        {/* Nota de origem */}
        <p
          className="text-xs"
          style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
        >
          {op.origem.estruturadoPorIA ? "Estruturado por IA · " : ""}
          {op.origem.revisadoPeloAutor ? "Revisado pelo autor" : "Aguardando revisao"}
          {" · "}
          {op.candidaturas.length} candidatura
          {op.candidaturas.length !== 1 ? "s" : ""}
        </p>

        {/* Ações */}
        {op.status === "aberta" && (
          <div className="flex flex-wrap gap-3">
            <BotaoCandidatura oportunidadeId={op.id} />
            <button
              className="h-11 rounded-[8px] border px-5 text-sm font-semibold"
              style={{
                borderColor: "var(--color-violet)",
                color: "var(--color-violet)",
                background: "transparent",
                fontFamily: "var(--font-body)",
                minWidth: "44px",
              }}
            >
              Indicar alguem
            </button>
          </div>
        )}

        {op.status !== "aberta" && (
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink3)" }}
          >
            Esta oportunidade esta {op.status === "em_selecao" ? "em selecao" : "fechada"}.
          </p>
        )}
      </div>
    </main>
  );
}
