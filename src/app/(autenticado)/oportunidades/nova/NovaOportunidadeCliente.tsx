"use client";

import { useState, useRef, useTransition } from "react";
import { extrairTicket, publicarOportunidade } from "./actions";
import type { TicketSerializado } from "./actions";

// ──────────────────────────────────────────────
// Utilitarios de apresentacao
// ──────────────────────────────────────────────

function formatarBudget(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatarFaixa(min?: number, max?: number) {
  if (min === undefined) return null;
  const fmt = (n: number) => (n >= 1000 ? `${n / 1000}k` : String(n));
  return max !== undefined ? `${fmt(min)}–${fmt(max)}` : `${fmt(min)}+`;
}

// ──────────────────────────────────────────────
// Realce de origem: sublinha trechos do texto
// bruto na cor do campo correspondente (spec 05)
// ──────────────────────────────────────────────

const COR_CAMPO: Record<string, string> = {
  marca: "#6c5bff",
  budget: "#117a53",
  prazo: "#ff5a2d",
  local: "#2b1fa8",
  regiao: "#a99cff",
  entregaveis: "#5c5a66",
};

function TextoComRealce({
  texto,
  origens,
}: {
  texto: string;
  origens: Array<{ campo: string; trecho: string }>;
}) {
  if (!origens.length) return <span>{texto}</span>;

  // Encontra todos os trechos reconhecidos no texto e marca com cor
  type Segmento = { texto: string; campo?: string };
  const segmentos: Segmento[] = [];
  let restante = texto;

  const origensFiltradas = origens
    .filter((o) => o.campo !== "textoBruto" && o.trecho && restante.includes(o.trecho))
    .sort((a, b) => restante.indexOf(a.trecho) - restante.indexOf(b.trecho));

  for (const origem of origensFiltradas) {
    const idx = restante.indexOf(origem.trecho);
    if (idx === -1) continue;
    if (idx > 0) segmentos.push({ texto: restante.slice(0, idx) });
    segmentos.push({ texto: origem.trecho, campo: origem.campo });
    restante = restante.slice(idx + origem.trecho.length);
  }
  if (restante) segmentos.push({ texto: restante });

  return (
    <span>
      {segmentos.map((s, i) =>
        s.campo ? (
          <mark
            key={i}
            style={{
              background: "transparent",
              borderBottom: `2px solid ${COR_CAMPO[s.campo] ?? "#6c5bff"}`,
              paddingBottom: "1px",
            }}
            title={s.campo}
          >
            {s.texto}
          </mark>
        ) : (
          <span key={i}>{s.texto}</span>
        ),
      )}
    </span>
  );
}

// ──────────────────────────────────────────────
// Indicador de confianca da extracao
// ──────────────────────────────────────────────

function IndicadorConfianca({ valor }: { valor: number }) {
  const pct = Math.round(valor * 100);
  const cor = valor >= 0.75 ? "#117a53" : valor >= 0.5 ? "#ff5a2d" : "#cc3300";
  const label =
    valor >= 0.75
      ? "Briefing rico — extracao confiavel"
      : valor >= 0.5
        ? "Briefing parcial — revise os campos em branco"
        : "Briefing raso — adicione mais detalhes antes de publicar";

  return (
    <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-mono)" }}>
      <div
        className="h-1.5 rounded-full flex-1"
        style={{ background: "var(--color-line)" }}
      >
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%`, background: cor }}
        />
      </div>
      <span className="text-xs" style={{ color: cor }}>
        {pct}%
      </span>
      <span className="text-xs" style={{ color: "var(--color-ink3)" }}>
        {label}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────
// Painel do ticket estruturado
// ──────────────────────────────────────────────

function PainelTicket({
  ticket,
  textoBruto,
  autorId,
  onPublicado,
}: {
  ticket: TicketSerializado;
  textoBruto: string;
  autorId: string;
  onPublicado: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handlePublicar() {
    startTransition(async () => {
      setErro(null);
      const fd = new FormData();
      fd.set("autorId", autorId);
      fd.set("textoBruto", textoBruto);
      fd.set("ticket", JSON.stringify(ticket));
      const res = await publicarOportunidade(fd);
      if (res.ok) {
        onPublicado(res.dados.id);
      } else {
        setErro(res.erro);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <IndicadorConfianca valor={ticket.confianca} />

      {/* Campos do ticket */}
      <div
        className="rounded-[12px] border p-5 flex flex-col gap-4"
        style={{ borderColor: "var(--color-line)", background: "var(--color-card)" }}
      >
        {ticket.marca && (
          <Campo label="MARCA" mono>
            {ticket.marca}
          </Campo>
        )}
        {ticket.budget !== undefined && (
          <Campo label="BUDGET" mono>
            {formatarBudget(ticket.budget)}
          </Campo>
        )}
        {ticket.prazo && (
          <Campo label="PRAZO" mono>
            {ticket.prazo}
          </Campo>
        )}
        {ticket.local && (
          <Campo label="LOCAL" mono>
            {ticket.local}
          </Campo>
        )}
        {ticket.regiao && (
          <Campo label="REGIAO" mono>
            {ticket.regiao}
          </Campo>
        )}
        {ticket.entregaveis.length > 0 && (
          <Campo label="ENTREGAVEIS">
            <div className="flex flex-wrap gap-1.5 mt-1">
              {ticket.entregaveis.map((e, i) => (
                <Chip key={i}>{e}</Chip>
              ))}
            </div>
          </Campo>
        )}

        {/* Squad */}
        <Campo label="SQUAD">
          <div className="flex flex-col gap-2 mt-1">
            {ticket.papeis.map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <span
                  className="rounded px-1.5 py-0.5 text-xs font-semibold"
                  style={{
                    background: "var(--color-violet-soft)",
                    color: "var(--color-violet-deep)",
                    minWidth: "1.5rem",
                    textAlign: "center",
                  }}
                >
                  {p.qtd}
                </span>
                <div>
                  <span style={{ color: "var(--color-ink)" }}>{p.funcao}</span>
                  {p.nicho && (
                    <span style={{ color: "var(--color-ink3)" }}>
                      {" "}
                      · {p.nicho}
                    </span>
                  )}
                  {formatarFaixa(p.seguidoresMin, p.seguidoresMax) && (
                    <span style={{ color: "var(--color-ink3)" }}>
                      {" "}
                      · {formatarFaixa(p.seguidoresMin, p.seguidoresMax)} segs
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Campo>
      </div>

      {/* Nota de auditabilidade (spec 05: deixar visivel que veio de IA) */}
      <p
        className="text-xs"
        style={{
          color: "var(--color-ink3)",
          fontFamily: "var(--font-mono)",
        }}
      >
        Estruturado por IA · revisao humana obrigatoria antes de publicar
      </p>

      {erro && (
        <p className="text-sm" style={{ color: "#cc3300" }}>
          {erro}
        </p>
      )}

      <button
        onClick={handlePublicar}
        disabled={isPending}
        className="h-11 rounded-[8px] font-semibold text-sm transition-opacity disabled:opacity-50"
        style={{
          background: "var(--color-violet)",
          color: "#fff",
          fontFamily: "var(--font-body)",
          minWidth: "44px",
        }}
      >
        {isPending ? "Publicando..." : "Publicar ticket"}
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Componentes atomicos
// ──────────────────────────────────────────────

function Campo({
  label,
  mono = false,
  children,
}: {
  label: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span
        className="text-xs font-medium tracking-widest uppercase block mb-0.5"
        style={{
          color: "var(--color-ink3)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {label}
      </span>
      <span
        className="text-sm"
        style={{
          color: "var(--color-ink)",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
        }}
      >
        {children}
      </span>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-[6px]"
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

// ──────────────────────────────────────────────
// Componente principal exportado
// ──────────────────────────────────────────────

export default function NovaOportunidadeCliente({
  autorId,
}: {
  autorId: string;
}) {
  const [textoBruto, setTextoBruto] = useState("");
  const [ticket, setTicket] = useState<TicketSerializado | null>(null);
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [publicadoId, setPublicadoId] = useState<string | null>(null);
  const painelRef = useRef<HTMLDivElement>(null);

  function handleEstruturar() {
    startTransition(async () => {
      setErro(null);
      setTicket(null);
      const fd = new FormData();
      fd.set("textoBruto", textoBruto);
      fd.set("autorId", autorId);
      const res = await extrairTicket(fd);
      if (res.ok) {
        setTicket(res.dados);
        // Scroll suave para o painel do ticket no mobile
        setTimeout(() => painelRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      } else {
        setErro(res.erro);
      }
    });
  }

  if (publicadoId) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ok)" }}
        >
          Ticket publicado
        </p>
        <p className="text-sm" style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}>
          ID: {publicadoId}
        </p>
        <button
          onClick={() => {
            setPublicadoId(null);
            setTicket(null);
            setTextoBruto("");
          }}
          className="text-sm underline mt-2"
          style={{ color: "var(--color-violet)" }}
        >
          Publicar outro ticket
        </button>
      </div>
    );
  }

  return (
    <div
      className="grid gap-6 w-full"
      style={{
        gridTemplateColumns: ticket ? "1fr 1fr" : "1fr",
        maxWidth: ticket ? "none" : "640px",
        margin: "0 auto",
      }}
    >
      {/* Painel esquerdo — briefing bruto */}
      <div className="flex flex-col gap-4">
        <label
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
        >
          Briefing bruto
        </label>

        {ticket ? (
          /* Modo leitura com realce de origem */
          <div
            className="rounded-[12px] border p-4 text-sm leading-relaxed min-h-[200px]"
            style={{
              borderColor: "var(--color-line)",
              background: "var(--color-card)",
              fontFamily: "var(--font-body)",
              color: "var(--color-ink)",
              whiteSpace: "pre-wrap",
            }}
          >
            <TextoComRealce texto={textoBruto} origens={ticket.origens} />
          </div>
        ) : (
          <textarea
            value={textoBruto}
            onChange={(e) => setTextoBruto(e.target.value)}
            placeholder={
              "Cole aqui o briefing como chegou — WhatsApp, e-mail, audio transcrito...\n\nEx.: Oi! Tô com um job da Natura pra setembro, skincare, preciso de 5 creators do NE, 50k–300k, budget 25 mil, 1 reels + 3 stories + evento em Recife dia 12/09."
            }
            rows={10}
            className="w-full rounded-[12px] border p-4 text-sm resize-none outline-none transition-colors"
            style={{
              borderColor: "var(--color-line)",
              background: "var(--color-card)",
              fontFamily: "var(--font-body)",
              color: "var(--color-ink)",
              fontSize: "16px", // evita zoom iOS (spec 04)
              lineHeight: "1.6",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--color-violet)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--color-line)")
            }
          />
        )}

        {erro && (
          <p className="text-sm" style={{ color: "#cc3300" }}>
            {erro}
          </p>
        )}

        {!ticket && (
          <button
            onClick={handleEstruturar}
            disabled={isPending || textoBruto.trim().length < 10}
            className="h-11 rounded-[8px] font-semibold text-sm transition-opacity disabled:opacity-40"
            style={{
              background: "var(--color-violet)",
              color: "#fff",
              fontFamily: "var(--font-body)",
            }}
          >
            {isPending ? "Estruturando..." : "Estruturar com IA"}
          </button>
        )}

        {ticket && (
          <button
            onClick={() => {
              setTicket(null);
              setErro(null);
            }}
            className="text-sm underline self-start"
            style={{ color: "var(--color-ink3)" }}
          >
            Editar briefing
          </button>
        )}
      </div>

      {/* Painel direito — ticket estruturado */}
      {ticket && (
        <div ref={painelRef} className="flex flex-col gap-4">
          <span
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
          >
            Ticket estruturado
          </span>
          <PainelTicket
            ticket={ticket}
            textoBruto={textoBruto}
            autorId={autorId}
            onPublicado={setPublicadoId}
          />
        </div>
      )}
    </div>
  );
}
