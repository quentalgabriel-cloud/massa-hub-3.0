import type { Metadata } from "next";
import Link from "next/link";
import { OportunidadeRepositorioSupabase } from "@infra/supabase/OportunidadeRepositorioSupabase";
import { PerfilRepositorioSupabase } from "@infra/supabase/PerfilRepositorioSupabase";
import { ListarOportunidades } from "@aplicacao/ListarOportunidades";
import { CardOportunidade } from "@/components/oportunidades/CardOportunidade";
import { FiltrosOportunidades } from "@/components/oportunidades/FiltrosOportunidades";

export const metadata: Metadata = {
  title: "Oportunidades — Massa Hub",
  description: "Oportunidades abertas na creator economy brasileira.",
};

interface PageProps {
  searchParams: Promise<{ nicho?: string; regiao?: string }>;
}

export default async function OportunidadesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nicho = params.nicho?.trim() || undefined;
  const regiao = params.regiao?.trim() || undefined;

  const repositorio = new OportunidadeRepositorioSupabase();
  const listar = new ListarOportunidades(
    repositorio,
    new PerfilRepositorioSupabase(),
  );

  const oportunidades = await listar.executar({ filtro: { nicho, regiao } });

  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Cabecalho */}
        <div className="flex items-baseline gap-3 mb-6">
          <h1
            className="text-3xl font-black leading-none"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-ink)",
              fontStretch: "condensed",
            }}
          >
            Oportunidades
          </h1>
          <span
            className="text-sm tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-ink3)",
            }}
          >
            {oportunidades.length} {oportunidades.length === 1 ? "aberta" : "abertas"}
          </span>
        </div>

        {/* Filtros */}
        <FiltrosOportunidades nichoAtivo={nicho} regiaoAtiva={regiao} />

        {/* Lista de oportunidades */}
        {oportunidades.length > 0 ? (
          <ul className="flex flex-col gap-3 mt-6">
            {oportunidades.map((op) => (
              <li key={op.id}>
                <CardOportunidade oportunidade={op} />
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="mt-12 flex flex-col items-center text-center gap-4 py-16 rounded-[12px] border border-line"
            style={{ background: "var(--color-card)" }}
          >
            <p
              className="text-base"
              style={{ color: "var(--color-ink2)" }}
            >
              Nenhuma oportunidade aberta no momento.
              <br />
              Volte em breve ou publique a primeira.
            </p>
            <Link
              href="/oportunidades/nova"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-[8px] text-sm font-semibold transition-colors"
              style={{
                background: "var(--color-violet)",
                color: "#fff",
                fontFamily: "var(--font-body)",
                minHeight: "44px",
              }}
            >
              Publicar oportunidade
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
