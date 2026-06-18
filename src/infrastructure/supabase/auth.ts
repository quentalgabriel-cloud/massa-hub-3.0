import { criarClienteSSR } from "./cliente";

// Leitura de identidade da sessao Supabase Auth. Fica na borda (infraestrutura):
// o dominio nao conhece auth. As Server Actions e o layout autenticado derivam
// o usuario aqui, em vez de confiar em IDs vindos do cliente (Ciclo 5).

export interface UsuarioAutenticado {
  id: string;
  email: string | null;
}

// Retorna o usuario autenticado ou null. Usa getUser() (valida o token no
// servidor), nunca getSession() — ver AGENTS.md secao 5.
export async function usuarioAtual(): Promise<UsuarioAutenticado | null> {
  const supabase = await criarClienteSSR();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}
