import { redirect } from "next/navigation";
import { criarClienteSSR } from "@infra/supabase/cliente";

// A home e so o roteador de entrada: logado vai para /oportunidades, deslogado
// para /login. Sem tela propria — evita ter dois lugares fazendo a mesma
// checagem (login/page.tsx ja faz esse mesmo roteamento).
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/oportunidades" : "/login");
}
