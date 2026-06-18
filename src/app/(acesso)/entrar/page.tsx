import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FormularioAcesso from "@/components/acesso/FormularioAcesso";
import { usuarioAtual } from "@infra/supabase/auth";
import { entrar } from "../actions";

export const metadata: Metadata = {
  title: "Entrar — Massa Hub",
};

export default async function EntrarPage() {
  // Ja autenticado nao precisa ver o login.
  if (await usuarioAtual()) redirect("/oportunidades");

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="w-full max-w-sm">
        <FormularioAcesso modo="entrar" acao={entrar} />
      </div>
    </main>
  );
}
