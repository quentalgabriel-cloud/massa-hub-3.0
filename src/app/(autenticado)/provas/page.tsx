import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteSSR, criarClienteServidor } from "@infra/supabase/cliente";
import { ProvaRepositorioSupabase } from "@infra/supabase/ProvaRepositorioSupabase";
import { PerfilRepositorioSupabase } from "@infra/supabase/PerfilRepositorioSupabase";
import type { Prova } from "@dominio/prova/Prova";
import BotaoAssinar from "./BotaoAssinar";

export const metadata: Metadata = {
  title: "Provas — Massa Hub",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs font-medium tracking-widest uppercase block mb-2"
      style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}

function StatusChip({ verificada }: { verificada: boolean }) {
  return (
    <span
      className="inline-block text-xs px-2 py-0.5 rounded-[6px]"
      style={{
        background: verificada
          ? "var(--color-violet-soft)"
          : "var(--color-paper)",
        color: verificada ? "var(--color-violet-deep)" : "var(--color-ink3)",
        border: verificada ? "none" : "1px solid var(--color-line)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {verificada ? "verificada" : "em andamento"}
    </span>
  );
}

// O nó nasce do trabalho (D7), nunca de cadastro solto: sem perfil, não há
// prova a registrar. Diz o caminho em vez de mostrar uma lista vazia sem razão.
function SemPerfil() {
  return (
    <main
      className="min-h-screen px-4 py-16"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="max-w-xl mx-auto">
        <h1
          className="text-3xl font-black leading-none mb-4"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-ink)",
            fontStretch: "condensed",
          }}
        >
          Provas exigem um perfil na rede
        </h1>
        <p className="text-base mb-8" style={{ color: "var(--color-ink2)" }}>
          Uma prova é trabalho real assinado pelos dois lados — os dois precisam
          ser nós da rede. Seu perfil nasce ao publicar uma oportunidade (como
          assessor) ou ao reivindicar um vínculo (como creator).
        </p>
        <Link
          href="/oportunidades/nova"
          className="inline-flex items-center px-5 rounded-[8px] text-sm font-semibold"
          style={{
            background: "var(--color-violet)",
            color: "#fff",
            fontFamily: "var(--font-body)",
            minHeight: "44px",
          }}
        >
          Publicar uma oportunidade
        </Link>
      </div>
    </main>
  );
}

export default async function ProvasPage() {
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Provas são entre nós da rede: listo pelo MEU perfil (não pelo id de auth).
  // Sem nó ainda? Não há prova possível — a página explica em vez de quebrar.
  const perfis = new PerfilRepositorioSupabase();
  const eu = await perfis.buscarPorUsuario(user.id);
  if (!eu) return <SemPerfil />;
  const meuId = eu.id;

  const repo = new ProvaRepositorioSupabase(criarClienteServidor());
  const provas = await repo.listarPorParte(meuId);

  const pendentes = provas.filter(
    (p) => !p.estaVerificada() && !p.assinaturas.some((a) => a.autorId === meuId),
  );
  const idOutraParte = (p: Prova) =>
    p.criadorId === meuId ? p.contratanteId : p.criadorId;

  // Resolve os nomes das contrapartes numa única query (sem N+1) — a tela
  // mostra "Ana Beauty · @anabeauty", nunca um id opaco.
  const contrapartes = await perfis.buscarPorIds([
    ...new Set(provas.map(idOutraParte)),
  ]);
  const porId = new Map(contrapartes.map((p) => [p.id, p]));
  const outraParte = (p: Prova) => {
    const perfil = porId.get(idOutraParte(p));
    return perfil ? `${perfil.nome} · @${perfil.handle.valor}` : "fora da rede";
  };

  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-10">
        {/* Cabecalho */}
        <div className="flex items-center justify-between gap-3">
          <h1
            className="text-3xl font-black leading-none"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-ink)",
              fontStretch: "condensed",
            }}
          >
            Provas
          </h1>
          <Link
            href="/provas/nova"
            className="inline-flex items-center px-4 rounded-[8px] text-sm font-semibold"
            style={{
              background: "var(--color-violet)",
              color: "#fff",
              fontFamily: "var(--font-body)",
              minHeight: "44px",
            }}
          >
            Registrar prova
          </Link>
        </div>

        {/* Aguardando sua assinatura */}
        <section>
          <Label>Aguardando sua assinatura</Label>
          {pendentes.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {pendentes.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-[12px] border"
                  style={{
                    borderColor: "var(--color-line)",
                    background: "var(--color-card)",
                  }}
                >
                  <div>
                    <p
                      className="text-base font-semibold"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {p.titulo}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{
                        color: "var(--color-ink3)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      com {outraParte(p)}
                    </p>
                  </div>
                  <BotaoAssinar provaId={p.id} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm" style={{ color: "var(--color-ink2)" }}>
              Nada aguardando sua assinatura.
            </p>
          )}
        </section>

        {/* Minhas provas */}
        <section>
          <Label>Minhas provas</Label>
          {provas.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {provas.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-[12px] border"
                  style={{
                    borderColor: "var(--color-line)",
                    background: "var(--color-card)",
                  }}
                >
                  <div>
                    <p
                      className="text-base font-semibold"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {p.titulo}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{
                        color: "var(--color-ink3)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      com {outraParte(p)}
                    </p>
                  </div>
                  <StatusChip verificada={p.estaVerificada()} />
                </li>
              ))}
            </ul>
          ) : (
            <div
              className="p-6 rounded-[12px] border text-center"
              style={{
                borderColor: "var(--color-line)",
                background: "var(--color-card)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--color-ink2)" }}>
                Aqui nao tem nota nem score. Lastro e trabalho real, assinado por
                quem participou.
                <br />
                Registre a primeira prova.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
