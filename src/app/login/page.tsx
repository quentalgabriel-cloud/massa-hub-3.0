import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { criarClienteSSR } from "@infra/supabase/cliente";
import BotaoEntrarGoogle from "./BotaoEntrarGoogle";

export const metadata: Metadata = {
  title: "Entrar — Massa Hub",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/oportunidades");

  const { erro } = await searchParams;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-paper)" }}
    >
      <div
        className="w-full max-w-sm rounded-[12px] border p-8 flex flex-col gap-6"
        style={{ borderColor: "var(--color-line)", background: "var(--color-card)" }}
      >
        <div>
          <span
            className="text-4xl font-black leading-none block"
            style={{
              fontFamily: "var(--font-display)",
              fontStretch: "condensed",
              color: "var(--color-ink)",
            }}
          >
            massa
          </span>
          <p className="text-sm mt-2" style={{ color: "var(--color-ink2)" }}>
            A rede da creator economy. Entre para abrir e acompanhar oportunidades.
          </p>
        </div>

        {erro && (
          <p
            className="text-xs"
            style={{ color: "var(--color-ember)", fontFamily: "var(--font-mono)" }}
          >
            Nao foi possivel concluir o login. Tente novamente.
          </p>
        )}

        <BotaoEntrarGoogle />

        <p
          className="text-xs"
          style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
        >
          Reputação é trabalho real, assinado por quem participou.
        </p>
      </div>
    </main>
  );
}
