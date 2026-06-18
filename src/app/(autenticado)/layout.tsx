import Link from "next/link";
import { redirect } from "next/navigation";
import LogoMassa from "@/components/ui/LogoMassa";
import { usuarioAtual } from "@infra/supabase/auth";
import { sair } from "../(acesso)/actions";

// Guarda do grupo autenticado (Ciclo 5): sem sessao, redireciona para /entrar.
// Renderiza um header minimo com a marca, o e-mail logado e o botao de sair.

export default async function LayoutAutenticado({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/entrar");

  return (
    <div style={{ background: "var(--color-paper)", minHeight: "100vh" }}>
      <header
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--color-line)" }}
      >
        <Link href="/oportunidades" className="text-ink" aria-label="Massa Hub">
          <LogoMassa altura={22} />
        </Link>
        <div className="flex items-center gap-4">
          <span
            className="text-xs hidden sm:inline"
            style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
          >
            {usuario.email}
          </span>
          <form action={sair}>
            <button
              type="submit"
              className="text-xs underline"
              style={{
                color: "var(--color-ink3)",
                fontFamily: "var(--font-mono)",
                minHeight: "44px",
              }}
            >
              sair
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
