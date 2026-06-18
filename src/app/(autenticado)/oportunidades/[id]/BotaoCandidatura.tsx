"use client";

import { useState, useTransition } from "react";
import { candidatar } from "./actions";

export default function BotaoCandidatura({
  oportunidadeId,
  perfilId = "perfil-dev",
}: {
  oportunidadeId: string;
  perfilId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [estado, setEstado] = useState<"idle" | "ok" | "erro">("idle");
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  function handleCandidatar() {
    startTransition(async () => {
      setEstado("idle");
      setMensagemErro(null);
      const fd = new FormData();
      fd.set("oportunidadeId", oportunidadeId);
      fd.set("perfilId", perfilId);
      const res = await candidatar(fd);
      if (res.ok) {
        setEstado("ok");
      } else {
        setEstado("erro");
        setMensagemErro(res.erro);
      }
    });
  }

  if (estado === "ok") {
    return (
      <div
        className="h-11 flex items-center justify-center rounded-[8px] px-5 text-sm font-semibold"
        style={{
          background: "var(--color-ok)",
          color: "#fff",
          fontFamily: "var(--font-mono)",
        }}
      >
        Candidatura enviada
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleCandidatar}
        disabled={isPending}
        className="h-11 rounded-[8px] px-5 text-sm font-semibold transition-opacity disabled:opacity-50"
        style={{
          background: "var(--color-violet)",
          color: "#fff",
          fontFamily: "var(--font-body)",
          minWidth: "44px",
        }}
      >
        {isPending ? "Candidatando..." : "Candidatar meu perfil"}
      </button>
      {estado === "erro" && mensagemErro && (
        <p className="text-xs" style={{ color: "#cc3300", fontFamily: "var(--font-mono)" }}>
          {mensagemErro}
        </p>
      )}
    </div>
  );
}
