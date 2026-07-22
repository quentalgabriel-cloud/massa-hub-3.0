"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { salvarPerfil } from "./actions";

const PAPEIS = [
  { v: "assessor", l: "Assessor" },
  { v: "creator", l: "Creator" },
  { v: "profissional", l: "Profissional criativo" },
];

const rotulo: CSSProperties = {
  color: "var(--color-ink3)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "0.375rem",
  display: "block",
};

const campo: CSSProperties = {
  width: "100%",
  fontSize: "16px", // evita zoom no iOS
  padding: "0.625rem 0.75rem",
  borderRadius: "8px",
  border: "1px solid var(--color-line)",
  background: "var(--color-card)",
  color: "var(--color-ink)",
  fontFamily: "var(--font-body)",
};

export interface ValoresPerfil {
  handle: string;
  nome: string;
  papel: string;
  tags: string;
  bio: string;
}

export default function FormPerfil({ inicial }: { inicial: ValoresPerfil }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      setErro(null);
      const res = await salvarPerfil(fd);
      if (res.ok) router.push(`/${res.handle}`);
      else setErro(res.erro);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label style={rotulo} htmlFor="nome">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          style={campo}
          defaultValue={inicial.nome}
          placeholder="Como voce assina seu trabalho"
        />
      </div>

      <div>
        <label style={rotulo} htmlFor="handle">
          Handle
        </label>
        <input
          id="handle"
          name="handle"
          style={campo}
          defaultValue={inicial.handle}
          placeholder="seu-handle"
        />
        <p
          className="text-xs mt-1.5"
          style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
        >
          massahub.com.br/<span style={{ color: "var(--color-ink2)" }}>handle</span>{" "}
          — minusculas, numeros e hifen.
        </p>
      </div>

      <div>
        <label style={rotulo} htmlFor="papel">
          Papel
        </label>
        <select
          id="papel"
          name="papel"
          style={campo}
          defaultValue={inicial.papel || "assessor"}
        >
          {PAPEIS.map((p) => (
            <option key={p.v} value={p.v}>
              {p.l}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={rotulo} htmlFor="tags">
          Tags (opcional)
        </label>
        <input
          id="tags"
          name="tags"
          style={campo}
          defaultValue={inicial.tags}
          placeholder="foto, video, edicao"
        />
        <p
          className="text-xs mt-1.5"
          style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
        >
          Separe por virgula. Ate 8.
        </p>
      </div>

      <div>
        <label style={rotulo} htmlFor="bio">
          Bio (opcional)
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          style={{ ...campo, resize: "vertical" }}
          defaultValue={inicial.bio}
          placeholder="Uma linha sobre o que voce faz."
        />
      </div>

      {erro && (
        <p
          className="text-sm"
          style={{ color: "var(--color-ember)", fontFamily: "var(--font-mono)" }}
        >
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-12 rounded-[8px] px-5 text-sm font-semibold transition-opacity disabled:opacity-50"
        style={{
          background: "var(--color-violet)",
          color: "#fff",
          fontFamily: "var(--font-body)",
        }}
      >
        {isPending ? "Salvando..." : "Salvar perfil"}
      </button>
    </form>
  );
}
