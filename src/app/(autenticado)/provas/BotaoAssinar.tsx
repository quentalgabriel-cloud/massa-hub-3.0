"use client";

import { useState, useTransition } from "react";
import { assinarProva } from "./actions";

export default function BotaoAssinar({ provaId }: { provaId: string }) {
  const [isPending, startTransition] = useTransition();
  const [estado, setEstado] = useState<"idle" | "ok" | "erro">("idle");
  const [erro, setErro] = useState<string | null>(null);

  function handleAssinar() {
    startTransition(async () => {
      setEstado("idle");
      setErro(null);
      const fd = new FormData();
      fd.set("provaId", provaId);
      const res = await assinarProva(fd);
      if (res.ok) setEstado("ok");
      else {
        setEstado("erro");
        setErro(res.erro);
      }
    });
  }

  if (estado === "ok") {
    return (
      <span
        className="text-sm font-semibold"
        style={{ color: "var(--color-ok)", fontFamily: "var(--font-mono)" }}
      >
        Assinada
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleAssinar}
        disabled={isPending}
        className="h-11 rounded-[8px] px-4 text-sm font-semibold transition-opacity disabled:opacity-50"
        style={{
          background: "var(--color-violet)",
          color: "#fff",
          fontFamily: "var(--font-body)",
          minWidth: "44px",
        }}
      >
        {isPending ? "Assinando..." : "Assinar"}
      </button>
      {estado === "erro" && erro && (
        <p
          className="text-xs"
          style={{ color: "var(--color-ember)", fontFamily: "var(--font-mono)" }}
        >
          {erro}
        </p>
      )}
    </div>
  );
}
