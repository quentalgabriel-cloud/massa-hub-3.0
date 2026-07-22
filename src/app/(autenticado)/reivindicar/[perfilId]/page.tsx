import type { Metadata } from "next";
import Link from "next/link";
import { PerfilRepositorioSupabase } from "@infra/supabase/PerfilRepositorioSupabase";
import { OportunidadeRepositorioSupabase } from "@infra/supabase/OportunidadeRepositorioSupabase";
import { criarClienteSSR } from "@infra/supabase/cliente";
import BotaoReivindicar from "./BotaoReivindicar";

export const metadata: Metadata = {
  title: "Reivindicar perfil — Massa Hub",
};

function Casca({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="max-w-md mx-auto flex flex-col gap-6">{children}</div>
    </main>
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

export default async function ReivindicarPerfilPage({
  params,
}: {
  params: Promise<{ perfilId: string }>;
}) {
  const { perfilId } = await params;

  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const perfil = await new PerfilRepositorioSupabase().buscarPorId(perfilId);

  if (!perfil) {
    return (
      <Casca>
        <p style={{ color: "var(--color-ink2)" }}>
          Perfil nao encontrado. Confira o link que voce recebeu.
        </p>
      </Casca>
    );
  }

  // Ja reivindicado — pela propria pessoa ou por outra.
  if (perfil.estado === "reivindicado") {
    const eSeu = perfil.usuarioId && user && perfil.usuarioId === user.id;
    return (
      <Casca>
        <div>
          <Label>Perfil</Label>
          <h1
            className="text-3xl font-black leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontStretch: "condensed",
              color: "var(--color-ink)",
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
        </div>
        <p style={{ color: "var(--color-ink2)" }}>
          {eSeu
            ? "Este perfil ja e seu."
            : "Este perfil ja foi reivindicado por outra pessoa."}
        </p>
        <Link
          href="/oportunidades"
          className="text-sm"
          style={{ color: "var(--color-violet)", fontFamily: "var(--font-mono)" }}
        >
          → Ver oportunidades
        </Link>
      </Casca>
    );
  }

  // Pendente: mostra a ancora (a oportunidade que trouxe a pessoa) e o convite.
  const op = perfil.origem
    ? await new OportunidadeRepositorioSupabase().buscarPorId(
        perfil.origem.oportunidadeId,
      )
    : null;

  return (
    <Casca>
      <div>
        <Label>Voce foi vinculado</Label>
        <h1
          className="text-3xl font-black leading-none"
          style={{
            fontFamily: "var(--font-display)",
            fontStretch: "condensed",
            color: "var(--color-ink)",
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
      </div>

      <div
        className="rounded-[12px] border p-4 flex flex-col gap-1"
        style={{ borderColor: "var(--color-line)", background: "var(--color-card)" }}
      >
        <Label>Ancora</Label>
        <p className="text-sm" style={{ color: "var(--color-ink)" }}>
          {op
            ? `Voce foi vinculado a uma oportunidade da marca ${op.marca}.`
            : "Voce foi vinculado a uma oportunidade real."}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-ink3)" }}>
          Todo perfil na rede nasce ancorado em trabalho real — esta e a sua
          primeira prova de trajetoria.
        </p>
      </div>

      <p className="text-sm" style={{ color: "var(--color-ink2)" }}>
        Este perfil e voce? Reivindique para assumir a sua trajetoria na rede.
      </p>

      <BotaoReivindicar perfilId={perfil.id} />
    </Casca>
  );
}
