import type { Metadata } from "next";
import NovaOportunidadeCliente from "./NovaOportunidadeCliente";

export const metadata: Metadata = {
  title: "Nova oportunidade — Massa Hub",
};

// Server Component: wrapper estatico. A logica interativa fica no Client Component.
// O autor da oportunidade e derivado da sessao Supabase Auth dentro da Server
// Action (Ciclo 5) — o cliente nao envia mais nenhum id.

export default function NovaOportunidadePage() {
  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ background: "var(--color-paper)" }}
    >
      {/* Cabecalho */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1
          className="text-3xl font-black leading-none mb-1"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-ink)",
            fontStretch: "condensed",
          }}
        >
          Nova oportunidade
        </h1>
        <p className="text-sm" style={{ color: "var(--color-ink3)" }}>
          Cole o briefing como chegou. A IA estrutura, voce revisa e publica.
        </p>
      </div>

      {/* Area principal */}
      <div className="max-w-5xl mx-auto">
        <NovaOportunidadeCliente />
      </div>
    </main>
  );
}
