import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FormularioAcesso from "@/components/acesso/FormularioAcesso";
import { usuarioAtual } from "@infra/supabase/auth";
import { cadastrar } from "../actions";

export const metadata: Metadata = {
  title: "Criar conta — Massa Hub",
};

export default async function CadastroPage() {
  if (await usuarioAtual()) redirect("/oportunidades");

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="w-full max-w-sm">
        <FormularioAcesso modo="cadastro" acao={cadastrar} />
      </div>
    </main>
  );
}
