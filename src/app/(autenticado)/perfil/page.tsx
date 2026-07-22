import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteSSR, criarClienteServidor } from "@infra/supabase/cliente";
import { PerfilRepositorioSupabase } from "@infra/supabase/PerfilRepositorioSupabase";
import FormPerfil, { type ValoresPerfil } from "./FormPerfil";

export const metadata: Metadata = {
  title: "Seu perfil — Massa Hub",
};

// Claim minimo: o usuario cria ou edita o proprio perfil. Se ja houver perfil
// reivindicado (buscarPorUsuario), preenche o formulario com os valores atuais.

export default async function EditarPerfilPage() {
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const repo = new PerfilRepositorioSupabase(criarClienteServidor());
  const existente = await repo.buscarPorUsuario(user.id);

  const inicial: ValoresPerfil = {
    handle: existente?.handle.valor ?? "",
    nome: existente?.nome ?? "",
    papel: existente?.papel ?? "assessor",
    tags: existente ? existente.tags.join(", ") : "",
    bio: existente?.bio ?? "",
  };

  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="max-w-lg mx-auto flex flex-col gap-8">
        <div>
          <h1
            className="text-3xl font-black leading-none mb-1"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-ink)",
              fontStretch: "condensed",
            }}
          >
            Seu perfil
          </h1>
          <p className="text-sm" style={{ color: "var(--color-ink3)" }}>
            {existente
              ? "Edite como voce aparece na rede."
              : "Reivindique seu perfil — o no que liga voce ao seu trabalho."}
          </p>
          {existente ? (
            <Link
              href={`/${existente.handle.valor}`}
              className="inline-block text-sm mt-2"
              style={{
                color: "var(--color-violet)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Ver perfil publico ↗
            </Link>
          ) : null}
        </div>

        <FormPerfil inicial={inicial} />
      </div>
    </main>
  );
}
