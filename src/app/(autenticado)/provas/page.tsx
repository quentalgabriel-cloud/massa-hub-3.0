import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteSSR, criarClienteServidor } from "@infra/supabase/cliente";
import { ProvaRepositorioSupabase } from "@infra/supabase/ProvaRepositorioSupabase";
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

export default async function ProvasPage() {
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const meuId = user.id;

  const repo = new ProvaRepositorioSupabase(criarClienteServidor());
  const provas = await repo.listarPorParte(meuId);

  const pendentes = provas.filter(
    (p) => !p.estaVerificada() && !p.assinaturas.some((a) => a.autorId === meuId),
  );
  const outraParte = (p: Prova) =>
    p.criadorId === meuId ? p.contratanteId : p.criadorId;

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
