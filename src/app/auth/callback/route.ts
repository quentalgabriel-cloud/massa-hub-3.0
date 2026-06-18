import { type NextRequest, NextResponse } from "next/server";
import { criarClienteSSR } from "@infra/supabase/cliente";

// Callback do OAuth: o Supabase redireciona pra ca com ?code=. Trocamos o code
// pela sessao (grava cookies via @supabase/ssr) e mandamos o usuario adiante.

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const proximo = searchParams.get("next") ?? "/oportunidades";

  if (code) {
    const supabase = await criarClienteSSR();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${proximo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?erro=auth`);
}
