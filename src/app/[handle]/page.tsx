import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VerPerfilPublico } from "@aplicacao/VerPerfilPublico";
import type { PerfilPublicoDTO } from "@aplicacao/VerPerfilPublico";
import { PerfilRepositorioSupabase } from "@infra/supabase/PerfilRepositorioSupabase";
import { OportunidadeRepositorioSupabase } from "@infra/supabase/OportunidadeRepositorioSupabase";
import { ProvaRepositorioSupabase } from "@infra/supabase/ProvaRepositorioSupabase";
import { criarClienteServidor } from "@infra/supabase/cliente";

// Pagina publica /handle — a superficie de reputacao. Mostra so FATOS contaveis
// (D1: Lastro, nunca score). Nao e vitrine: sem showcase enfeitado, sem heatmap
// vazio (CLAUDE.md secao 3 — heatmap so com dados reais suficientes).

// Dinamica por natureza: le o banco (via service role) a cada request. Sem
// prerender em build — evita crash quando as env vars nao existem no build.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ handle: string }>;
}

function montarCasoDeUso(): VerPerfilPublico {
  return new VerPerfilPublico(
    new PerfilRepositorioSupabase(),
    new OportunidadeRepositorioSupabase(),
    new ProvaRepositorioSupabase(criarClienteServidor()),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const dto = await montarCasoDeUso().executar(handle);
  if (!dto) return { title: "Perfil não encontrado — Massa Hub" };
  return {
    title: `${dto.nome} (@${dto.handle}) — Massa Hub`,
    description: `Lastro de ${dto.nome} na creator economy brasileira.`,
  };
}

export default async function PerfilPublicoPage({ params }: PageProps) {
  const { handle } = await params;
  const dto = await montarCasoDeUso().executar(handle);
  if (!dto) notFound();

  return (
    <main
      className="min-h-screen px-4 py-12"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="max-w-2xl mx-auto">
        <Cabecalho dto={dto} />
        <Fatos dto={dto} />
      </div>
    </main>
  );
}

function Cabecalho({ dto }: { dto: PerfilPublicoDTO }) {
  const rotuloTipo = dto.tipo === "assessor" ? "Assessor" : "Creator";
  return (
    <header className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <span
          className="text-xs uppercase tracking-wider px-2 py-1 rounded-[6px]"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-violet)",
            background: "color-mix(in srgb, var(--color-violet) 10%, transparent)",
          }}
        >
          {rotuloTipo}
        </span>
        {dto.estado === "pendente" && (
          <span
            className="text-xs"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-ink3)",
            }}
          >
            não reivindicado
          </span>
        )}
      </div>
      <h1
        className="text-4xl font-black leading-none mb-1"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-ink)",
          fontStretch: "condensed",
        }}
      >
        {dto.nome}
      </h1>
      <p
        className="text-base"
        style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink3)" }}
      >
        @{dto.handle}
      </p>
    </header>
  );
}

// O recorte de fato depende do tipo, no vocabulario do dominio:
// assessor -> Atividade (oportunidades); creator -> Lastro (provas verificadas).
function Fatos({ dto }: { dto: PerfilPublicoDTO }) {
  if (dto.tipo === "assessor") {
    const { oportunidadesPublicadas, marcasAtendidas } = dto.atividade;
    if (oportunidadesPublicadas === 0) {
      return (
        <Vazio texto="Ainda sem atividade registrada. A atividade nasce ao publicar oportunidades reais." />
      );
    }
    return (
      <div className="flex flex-col gap-8">
        <Secao titulo="Atividade">
          <Fato
            n={oportunidadesPublicadas}
            rotulo="oportunidade publicada"
            plural="oportunidades publicadas"
          />
          <Fato
            n={marcasAtendidas}
            rotulo="marca atendida"
            plural="marcas atendidas"
          />
        </Secao>
        <ListaOportunidades oportunidades={dto.oportunidades} />
      </div>
    );
  }

  const { provasVerificadas, marcasDistintas, marcasRecorrentes } = dto.lastro;
  if (provasVerificadas === 0) {
    return (
      <Vazio texto="Ainda sem lastro registrado. O lastro nasce do trabalho assinado pelos dois lados." />
    );
  }
  return (
    <Secao titulo="Lastro">
      <Fato
        n={provasVerificadas}
        rotulo="prova verificada"
        plural="provas verificadas"
      />
      <Fato
        n={marcasDistintas}
        rotulo="marca distinta"
        plural="marcas distintas"
      />
      <Fato
        n={marcasRecorrentes}
        rotulo="marca recorrente"
        plural="marcas recorrentes"
      />
    </Secao>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className="text-xs uppercase tracking-wider mb-4"
        style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink3)" }}
      >
        {titulo}
      </h2>
      <div className="grid grid-cols-3 gap-3">{children}</div>
    </section>
  );
}

// Fato = numero cru + rotulo (nunca nota/score). Numero em mono, tabular.
// `rotulo` e o singular; `plural` e usado quando n != 1 ("1 prova verificada",
// "3 provas verificadas") — 0 usa o plural, como em PT-BR.
function Fato({
  n,
  rotulo,
  plural,
}: {
  n: number;
  rotulo: string;
  plural: string;
}) {
  return (
    <div
      className="flex flex-col gap-1 p-4 rounded-[12px] border border-line"
      style={{ background: "var(--color-card)" }}
    >
      <span
        className="text-3xl font-bold tabular-nums leading-none"
        style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}
      >
        {n}
      </span>
      <span className="text-xs" style={{ color: "var(--color-ink2)" }}>
        {n === 1 ? rotulo : plural}
      </span>
    </div>
  );
}

// A rede tecida: as oportunidades do assessor linkam para o próprio ticket.
function ListaOportunidades({
  oportunidades,
}: {
  oportunidades: { id: string; marca: string }[];
}) {
  return (
    <section>
      <h2
        className="text-xs uppercase tracking-wider mb-4"
        style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink3)" }}
      >
        Oportunidades
      </h2>
      <ul className="flex flex-col gap-2">
        {oportunidades.map((o) => (
          <li key={o.id}>
            <Link
              href={`/oportunidades/${o.id}`}
              className="flex items-center justify-between p-3 rounded-[10px] border border-line transition-colors hover:border-violet"
              style={{ background: "var(--color-card)" }}
            >
              <span
                className="text-base font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-ink)",
                  fontStretch: "condensed",
                }}
              >
                {o.marca}
              </span>
              <span
                className="text-xs"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-ink3)",
                }}
              >
                ver ticket →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <div
      className="py-16 px-6 rounded-[12px] border border-line text-center"
      style={{ background: "var(--color-card)" }}
    >
      <p className="text-base" style={{ color: "var(--color-ink2)" }}>
        {texto}
      </p>
    </div>
  );
}
