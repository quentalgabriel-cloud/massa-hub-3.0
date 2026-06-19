"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { registrarProva } from "../actions";

const TIPOS = [
  { v: "campanha", l: "Campanha" },
  { v: "consultoria", l: "Consultoria" },
  { v: "festival", l: "Festival" },
  { v: "negociacao", l: "Negociacao" },
  { v: "outro", l: "Outro" },
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

export default function FormRegistrarProva() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      setErro(null);
      const res = await registrarProva(fd);
      if (res.ok) router.push("/provas");
      else setErro(res.erro);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label style={rotulo} htmlFor="tipo">
          Tipo
        </label>
        <select id="tipo" name="tipo" style={campo} defaultValue="campanha">
          {TIPOS.map((t) => (
            <option key={t.v} value={t.v}>
              {t.l}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={rotulo} htmlFor="titulo">
          Titulo
        </label>
        <input
          id="titulo"
          name="titulo"
          style={campo}
          placeholder="Ex.: Campanha de verao com a Marca X"
        />
      </div>

      <div>
        <label style={rotulo} htmlFor="descricao">
          Descricao
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          style={{ ...campo, resize: "vertical" }}
          placeholder="O papel que voce desempenhou no trabalho."
        />
      </div>

      <div>
        <label style={rotulo} htmlFor="resultado">
          Resultado (opcional)
        </label>
        <input
          id="resultado"
          name="resultado"
          style={campo}
          placeholder='Ex.: "+2,3M impressoes"'
        />
      </div>

      <fieldset>
        <span style={rotulo}>Seu lado nesta prova</span>
        <div className="flex flex-col gap-2">
          <label
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--color-ink)", minHeight: "44px" }}
          >
            <input
              type="radio"
              name="ladoRegistrante"
              value="criador"
              defaultChecked
            />
            Sou o criador (quem fez o trabalho)
          </label>
          <label
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--color-ink)", minHeight: "44px" }}
          >
            <input type="radio" name="ladoRegistrante" value="contratante" />
            Sou o contratante (quem contratou)
          </label>
        </div>
      </fieldset>

      <div>
        <label style={rotulo} htmlFor="outraParteId">
          ID da outra parte
        </label>
        <input id="outraParteId" name="outraParteId" style={campo} />
        <p
          className="text-xs mt-1.5"
          style={{ color: "var(--color-ink3)", fontFamily: "var(--font-mono)" }}
        >
          Por enquanto, cole o ID do usuario da outra parte. Um seletor por perfil
          vem quando existir diretorio de perfis.
        </p>
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
        {isPending ? "Registrando..." : "Registrar prova"}
      </button>
    </form>
  );
}
