import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { criarClienteServidor } from "@infra/supabase/cliente";
import { PerfilRepositorioSupabase } from "@infra/supabase/PerfilRepositorioSupabase";
import { ProvaRepositorioSupabase } from "@infra/supabase/ProvaRepositorioSupabase";
import { MontarPerfilPublico } from "@aplicacao/MontarPerfilPublico";
import type { PapelPerfil } from "@dominio/perfil/Perfil";
import RitmoHeatmap from "@/components/perfil/RitmoHeatmap";

// Pagina publica /<handle>. Server Component: le via service role (bypassa RLS),
// mesmo padrao das demais leituras. E a "vitrine que nao e vitrine": o que vende
// a pessoa sao as Provas (trabalho verificavel), nao um score (D1).

const ROTULO_PAPEL: Record<PapelPerfil, string> = {
  assessor: "Assessor",
  creator: "Creator",
  profissional: "Profissional criativo",
};

function montar(handle: string) {
  const cliente = criarClienteServidor();
  return new MontarPerfilPublico(
    new PerfilRepositorioSupabase(cliente),
    new ProvaRepositorioSupabase(cliente),
  ).executar(handle);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const publico = await montar(handle);
  if (!publico) return { title: "Perfil nao encontrado — Massa Hub" };
  return {
    title: `${publico.perfil.nome} (@${publico.perfil.handle.valor}) — Massa Hub`,
  };
}

function Iniciais({ nome }: { nome: string }) {
  const iniciais = nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      className="w-16 h-16 rounded-[14px] flex items-center justify-center text-2xl font-black shrink-0"
      style={{
        background: "var(--color-violet-soft)",
        color: "var(--color-violet-deep)",
        fontFamily: "var(--font-display)",
      }}
    >
      {iniciais}
    </div>
  );
}

function Fato({ n, rotulo }: { n: number; rotulo: string }) {
  return (
    <div
      className="flex-1 min-w-[120px] p-4 rounded-[12px] border"
      style={{ borderColor: "var(--color-line)", background: "var(--color-card)" }}
    >
      <div
        className="text-2xl font-black leading-none"
        style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}
      >
        {n}
      </div>
      <div
        className="text-xs mt-1 tracking-wide"
        style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
      >
        {rotulo}
      </div>
    </div>
  );
}

export default async function PerfilPublicoPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const publico = await montar(handle);
  if (!publico) notFound();

  const { perfil, provasEmDestaque, lastro, ritmo } = publico;
  const ehAssessor = perfil.ehAssessor();

  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-10">
        {/* Band de identidade */}
        <header className="flex items-start gap-4">
          <Iniciais nome={perfil.nome} />
          <div className="min-w-0">
            <h1
              className="text-3xl font-black leading-none"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-ink)",
                fontStretch: "condensed",
              }}
            >
              {perfil.nome}
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
            >
              @{perfil.handle.valor}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* A tag de assessor tem destaque (cavalo de Troia da rede) */}
              <span
                className="inline-block text-xs px-2 py-0.5 rounded-[6px]"
                style={{
                  background: ehAssessor
                    ? "var(--color-violet)"
                    : "var(--color-violet-soft)",
                  color: ehAssessor ? "#fff" : "var(--color-violet-deep)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {ROTULO_PAPEL[perfil.papel]}
              </span>
              {perfil.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block text-xs px-2 py-0.5 rounded-[6px] border"
                  style={{
                    borderColor: "var(--color-line)",
                    color: "var(--color-ink2)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            {perfil.bio ? (
              <p
                className="text-sm mt-3"
                style={{ color: "var(--color-ink2)" }}
              >
                {perfil.bio}
              </p>
            ) : null}
          </div>
        </header>

        {/* Provas em destaque — o conteudo que vende a pessoa */}
        <section>
          <h2
            className="text-xs font-medium tracking-widest uppercase mb-3"
            style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
          >
            Provas
          </h2>
          {provasEmDestaque.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {provasEmDestaque.map((p) => (
                <li
                  key={p.id}
                  className="p-4 rounded-[12px] border"
                  style={{
                    borderColor: "var(--color-line)",
                    background: "var(--color-card)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className="text-base font-semibold"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {p.titulo}
                    </p>
                    <span
                      className="inline-block text-xs px-2 py-0.5 rounded-[6px] shrink-0"
                      style={{
                        background: "var(--color-violet-soft)",
                        color: "var(--color-violet-deep)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      verificada
                    </span>
                  </div>
                  {p.resultado ? (
                    <p
                      className="text-sm mt-1"
                      style={{
                        color: "var(--color-ink2)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {p.resultado}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm" style={{ color: "var(--color-ink2)" }}>
              Ainda sem provas verificadas. Reputacao aqui e trabalho real,
              assinado pelos dois lados — nao score.
            </p>
          )}
        </section>

        {/* Ritmo — so quando ha volume real (spec 01) */}
        {ritmo.deveRenderizar ? (
          <section>
            <h2
              className="text-xs font-medium tracking-widest uppercase mb-3"
              style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
            >
              Ritmo
            </h2>
            <RitmoHeatmap ritmo={ritmo} />
          </section>
        ) : null}

        {/* Lastro — fatos contaveis, nunca score (D1) */}
        <section>
          <h2
            className="text-xs font-medium tracking-widest uppercase mb-3"
            style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
          >
            Lastro
          </h2>
          <div className="flex flex-wrap gap-3">
            <Fato n={lastro.nProvasVerificadas} rotulo="provas verificadas" />
            <Fato n={lastro.marcasDistintas} rotulo="marcas distintas" />
            <Fato n={lastro.marcasRecorrentes} rotulo="marcas recorrentes" />
          </div>
        </section>
      </div>
    </main>
  );
}
