"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

// Client Component: NAO importa de @infra/supabase/cliente (aquele modulo puxa
// next/headers, server-only). Cria o cliente browser direto com as chaves NEXT_PUBLIC.

export default function BotaoEntrarGoogle() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar() {
    setCarregando(true);
    setErro(null);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setCarregando(false);
      setErro("Nao foi possivel iniciar o login. Tente de novo.");
    }
    // Em caso de sucesso o browser e redirecionado para o Google.
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={entrar}
        disabled={carregando}
        className="h-12 rounded-[8px] px-5 text-sm font-semibold transition-opacity disabled:opacity-50"
        style={{
          background: "var(--color-violet)",
          color: "#fff",
          fontFamily: "var(--font-body)",
        }}
      >
        {carregando ? "Redirecionando..." : "Entrar com Google"}
      </button>
      {erro && (
        <p
          className="text-xs"
          style={{ color: "var(--color-ember)", fontFamily: "var(--font-mono)" }}
        >
          {erro}
        </p>
      )}
    </div>
  );
}
