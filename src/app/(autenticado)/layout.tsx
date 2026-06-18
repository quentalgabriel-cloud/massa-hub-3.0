import { redirect } from "next/navigation";
import Link from "next/link";
import { criarClienteSSR } from "@infra/supabase/cliente";

// Guard de rota: tudo sob (autenticado) exige sessao. Sem usuario -> /login.
// Renderiza uma barra fina com a marca e o "Sair". Nao tem <html>/<body>:
// e um layout aninhado, o root layout ja cuida disso.

export default async function LayoutAutenticado({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <header
        className="h-14 px-4 flex items-center justify-between border-b"
        style={{ borderColor: "var(--color-line)", background: "var(--color-paper)" }}
      >
        <Link
          href="/oportunidades"
          className="text-xl font-black leading-none"
          style={{
            fontFamily: "var(--font-display)",
            fontStretch: "condensed",
            color: "var(--color-ink)",
          }}
        >
          massa
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-sm px-3 flex items-center"
            style={{
              color: "var(--color-ink3)",
              fontFamily: "var(--font-mono)",
              minHeight: "44px",
            }}
          >
            Sair
          </button>
        </form>
      </header>
      {children}
    </>
  );
}
