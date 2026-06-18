import { NextResponse } from "next/server";
import { criarClienteSSR } from "@infra/supabase/cliente";

// Logout: encerra a sessao e volta pro login. 303 converte o POST em GET no redirect.

export async function POST(request: Request) {
  const supabase = await criarClienteSSR();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
