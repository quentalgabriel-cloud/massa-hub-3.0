"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { criarClienteSSR } from "@infra/supabase/cliente";

// Server Actions de acesso (Ciclo 5): e-mail + senha via Supabase Auth.
// Escrevem o cookie de sessao atraves do cliente SSR. Em sucesso, redirecionam
// para o modulo de oportunidades; em erro, devolvem mensagem para a UI.

type Resultado<T> = { ok: true; dados: T } | { ok: false; erro: string };

const schema = z.object({
  email: z.string().email("E-mail invalido."),
  senha: z.string().min(8, "A senha precisa de ao menos 8 caracteres."),
});

const DESTINO_POS_LOGIN = "/oportunidades";

export async function entrar(
  formData: FormData,
): Promise<Resultado<never>> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.errors[0].message };
  }

  const supabase = await criarClienteSSR();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.senha,
  });

  if (error) {
    return { ok: false, erro: "E-mail ou senha incorretos." };
  }

  redirect(DESTINO_POS_LOGIN);
}

export async function cadastrar(
  formData: FormData,
): Promise<Resultado<{ precisaConfirmar: boolean }>> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.errors[0].message };
  }

  const supabase = await criarClienteSSR();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.senha,
  });

  if (error) {
    return { ok: false, erro: error.message };
  }

  // Se o projeto exige confirmacao de e-mail, signUp nao abre sessao.
  // Sinalizamos para a UI orientar o usuario a checar o e-mail.
  if (!data.session) {
    return { ok: true, dados: { precisaConfirmar: true } };
  }

  redirect(DESTINO_POS_LOGIN);
}

export async function sair(): Promise<void> {
  const supabase = await criarClienteSSR();
  await supabase.auth.signOut();
  redirect("/entrar");
}
