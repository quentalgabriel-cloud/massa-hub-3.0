"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import LogoMassa from "@/components/ui/LogoMassa";

type Resultado =
  | { ok: true; dados?: { precisaConfirmar?: boolean } }
  | { ok: false; erro: string };

type Props = {
  modo: "entrar" | "cadastro";
  acao: (formData: FormData) => Promise<Resultado>;
};

export default function FormularioAcesso({ modo, acao }: Props) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  const ehCadastro = modo === "cadastro";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      setErro(null);
      const res = await acao(formData);
      // Em sucesso com redirect, o componente desmonta antes de chegar aqui.
      if (res && res.ok === false) {
        setErro(res.erro);
      } else if (res && res.ok && res.dados?.precisaConfirmar) {
        setConfirmar(true);
      }
    });
  }

  if (confirmar) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          Confira seu e-mail
        </p>
        <p className="text-sm" style={{ color: "var(--color-ink3)" }}>
          Enviamos um link de confirmacao. Clique nele para ativar sua conta e
          depois faca login.
        </p>
        <Link
          href="/entrar"
          className="text-sm underline mt-2"
          style={{ color: "var(--color-violet)" }}
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 mb-2">
        <LogoMassa altura={28} className="text-ink" />
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
        >
          {ehCadastro ? "criar conta" : "entrar"}
        </p>
      </div>

      <label className="flex flex-col gap-1">
        <span
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
        >
          E-mail
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11 rounded-[8px] border px-3 outline-none transition-colors"
          style={{
            borderColor: "var(--color-line)",
            background: "var(--color-card)",
            color: "var(--color-ink)",
            fontSize: "16px",
          }}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
        >
          Senha
        </span>
        <input
          name="senha"
          type="password"
          autoComplete={ehCadastro ? "new-password" : "current-password"}
          required
          minLength={8}
          className="h-11 rounded-[8px] border px-3 outline-none transition-colors"
          style={{
            borderColor: "var(--color-line)",
            background: "var(--color-card)",
            color: "var(--color-ink)",
            fontSize: "16px",
          }}
        />
      </label>

      {erro && (
        <p className="text-sm" style={{ color: "#cc3300" }}>
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-11 rounded-[8px] font-semibold text-sm transition-opacity disabled:opacity-50"
        style={{
          background: "var(--color-violet)",
          color: "#fff",
          fontFamily: "var(--font-body)",
          minWidth: "44px",
        }}
      >
        {isPending
          ? "Aguarde..."
          : ehCadastro
            ? "Criar conta"
            : "Entrar"}
      </button>

      <p className="text-sm text-center" style={{ color: "var(--color-ink3)" }}>
        {ehCadastro ? (
          <>
            Ja tem conta?{" "}
            <Link
              href="/entrar"
              className="underline"
              style={{ color: "var(--color-violet)" }}
            >
              Entrar
            </Link>
          </>
        ) : (
          <>
            Ainda nao tem conta?{" "}
            <Link
              href="/cadastro"
              className="underline"
              style={{ color: "var(--color-violet)" }}
            >
              Criar conta
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
