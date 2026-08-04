import type { Metadata } from "next";
import Link from "next/link";
import { ExplorarRede } from "@aplicacao/ExplorarRede";
import type { PerfilNaRede } from "@aplicacao/ExplorarRede";
import { PerfilRepositorioSupabase } from "@infra/supabase/PerfilRepositorioSupabase";
import { ProvaRepositorioSupabase } from "@infra/supabase/ProvaRepositorioSupabase";
import { OportunidadeRepositorioSupabase } from "@infra/supabase/OportunidadeRepositorioSupabase";
import { criarClienteServidor } from "@infra/supabase/cliente";

// Explorar a rede — quem está nela e o que cada um tem de trabalho registrado.
// NÃO é vitrine (§2): cada pessoa aparece pelos FATOS, nunca por bio ou score.
// Quem não tem trabalho aparece sem número, e isso é informação honesta.

export const metadata: Metadata = { title: "Rede — Massa Hub" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ busca?: string; tipo?: string }>;
}

export default async function RedePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const busca = params.busca?.trim() || undefined;
  const tipo =
    params.tipo === "assessor" || params.tipo === "creator"
      ? params.tipo
      : undefined;

  const caso = new ExplorarRede(
    new PerfilRepositorioSupabase(),
    new ProvaRepositorioSupabase(criarClienteServidor()),
    new OportunidadeRepositorioSupabase(),
  );
  const pessoas = await caso.executar({ busca, tipo });

  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-baseline gap-3 mb-6">
          <h1
            className="text-3xl font-black leading-none"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-ink)",
              fontStretch: "condensed",
            }}
          >
            Rede
          </h1>
          <span
            className="text-sm tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-ink3)",
            }}
          >
            {pessoas.length} {pessoas.length === 1 ? "pessoa" : "pessoas"}
          </span>
        </div>

        <Filtros busca={busca} tipo={tipo} />

        {pessoas.length > 0 ? (
          <ul className="flex flex-col gap-3 mt-6">
            {pessoas.map((p) => (
              <li key={p.id}>
                <CardPessoa pessoa={p} />
              </li>
            ))}
          </ul>
        ) : (
          <Vazio filtrando={Boolean(busca || tipo)} />
        )}
      </div>
    </main>
  );
}

// Busca por GET: o estado vive na URL, então o resultado é compartilhável e o
// botão voltar funciona. Sem JS de cliente para uma lista.
function Filtros({ busca, tipo }: { busca?: string; tipo?: string }) {
  const chip = (rotulo: string, valor?: string) => {
    const ativo = tipo === valor;
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (valor) params.set("tipo", valor);
    const href = params.toString() ? `/rede?${params}` : "/rede";
    return (
      <Link
        key={rotulo}
        href={href}
        className="px-3 py-1.5 rounded-[6px] text-xs border transition-colors"
        style={{
          fontFamily: "var(--font-mono)",
          borderColor: ativo ? "var(--color-violet)" : "var(--color-line)",
          background: ativo ? "var(--color-violet-soft)" : "var(--color-card)",
          color: ativo ? "var(--color-violet-deep)" : "var(--color-ink2)",
        }}
      >
        {rotulo}
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <form action="/rede" method="get" className="flex gap-2">
        {tipo && <input type="hidden" name="tipo" value={tipo} />}
        <input
          name="busca"
          defaultValue={busca}
          placeholder="Buscar por nome ou @handle"
          autoCapitalize="none"
          autoCorrect="off"
          className="h-11 flex-1 rounded-[8px] border px-3 text-sm outline-none"
          style={{
            borderColor: "var(--color-line)",
            background: "var(--color-card)",
            color: "var(--color-ink)",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          className="h-11 px-4 rounded-[8px] text-sm font-semibold"
          style={{
            background: "var(--color-violet)",
            color: "#fff",
            fontFamily: "var(--font-body)",
          }}
        >
          Buscar
        </button>
      </form>
      <div className="flex gap-2">
        {chip("todos")}
        {chip("assessores", "assessor")}
        {chip("creators", "creator")}
      </div>
    </div>
  );
}

function CardPessoa({ pessoa }: { pessoa: PerfilNaRede }) {
  const fatos =
    pessoa.tipo === "assessor"
      ? [
          [pessoa.oportunidadesPublicadas, "oportunidade", "oportunidades"],
          [pessoa.provasVerificadas, "prova", "provas"],
        ]
      : [
          [pessoa.provasVerificadas, "prova", "provas"],
          [pessoa.marcasDistintas, "marca", "marcas"],
        ];

  const semTrabalho = fatos.every(([n]) => n === 0);

  return (
    <Link
      href={`/${pessoa.handle}`}
      className="block rounded-[12px] border p-4 transition-colors hover:border-violet"
      style={{
        borderColor: "var(--color-line)",
        background: "var(--color-card)",
      }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span
          className="text-base font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-ink)",
            fontStretch: "condensed",
          }}
        >
          {pessoa.nome}
        </span>
        <span
          className="text-[10px] uppercase tracking-wider shrink-0"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-ink3)",
          }}
        >
          {pessoa.tipo}
          {pessoa.estado === "pendente" && " · não reivindicado"}
        </span>
      </div>

      <span
        className="text-xs block mb-2"
        style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink3)" }}
      >
        @{pessoa.handle}
      </span>

      {semTrabalho ? (
        <span
          className="text-xs"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink3)" }}
        >
          sem trabalho registrado ainda
        </span>
      ) : (
        <div className="flex gap-4">
          {fatos.map(([n, singular, plural]) => (
            <span
              key={String(singular)}
              className="text-xs tabular-nums"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-ink2)",
              }}
            >
              <strong style={{ color: "var(--color-ink)" }}>{n}</strong>{" "}
              {n === 1 ? singular : plural}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

function Vazio({ filtrando }: { filtrando: boolean }) {
  return (
    <div
      className="mt-6 py-16 px-6 rounded-[12px] border text-center"
      style={{
        borderColor: "var(--color-line)",
        background: "var(--color-card)",
      }}
    >
      <p className="text-base" style={{ color: "var(--color-ink2)" }}>
        {filtrando ? (
          "Ninguém na rede com esse critério."
        ) : (
          <>
            A rede ainda está vazia.
            <br />
            Ela cresce pelo trabalho: publique uma oportunidade e vincule quem
            participou.
          </>
        )}
      </p>
    </div>
  );
}
