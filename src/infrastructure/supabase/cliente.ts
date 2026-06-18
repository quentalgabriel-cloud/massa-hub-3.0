import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Factory do cliente Supabase para uso SERVER-SIDE (service role).
// O service role bypassa RLS; NUNCA exponha esta chave ao client.
// Esta pasta e a unica fronteira que conhece o Supabase (adapter). Ver D11.

export function criarClienteServidor(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorias.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
