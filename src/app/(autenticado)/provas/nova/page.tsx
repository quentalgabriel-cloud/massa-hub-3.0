import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { criarClienteSSR } from "@infra/supabase/cliente";
import FormRegistrarProva from "./FormRegistrarProva";

export const metadata: Metadata = {
  title: "Registrar prova — Massa Hub",
};

export default async function NovaProvaPage() {
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="max-w-xl mx-auto">
        <h1
          className="text-3xl font-black leading-none mb-1"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-ink)",
            fontStretch: "condensed",
          }}
        >
          Registrar prova
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-ink3)" }}>
          Um trabalho real, assinado pelos dois lados. Voce assina ja; a outra
          parte confirma para a prova virar verificada.
        </p>
        <FormRegistrarProva />
      </div>
    </main>
  );
}
