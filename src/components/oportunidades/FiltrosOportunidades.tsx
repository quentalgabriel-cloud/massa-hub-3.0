"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

// Nichos frequentes usados como chips rapidos de filtro.
const NICHOS_FREQUENTES = [
  "Moda",
  "Beleza",
  "Gastronomia",
  "Fitness",
  "Tech",
  "Games",
  "Lifestyle",
];

interface Props {
  nichoAtivo?: string;
  regiaoAtiva?: string;
}

export function FiltrosOportunidades({ nichoAtivo, regiaoAtiva }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const atualizar = useCallback(
    (chave: string, valor: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (valor) {
        params.set(chave, valor);
      } else {
        params.delete(chave);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const alternarNicho = (nicho: string) => {
    const novo = nichoAtivo?.toLowerCase() === nicho.toLowerCase() ? undefined : nicho;
    atualizar("nicho", novo);
  };

  const limparFiltros = () => {
    router.push(pathname);
  };

  const temFiltroAtivo = !!nichoAtivo || !!regiaoAtiva;

  return (
    <div className="flex flex-col gap-3">
      {/* Chips de nicho */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-[10px] tracking-widest shrink-0"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-ink3)",
          }}
        >
          NICHO
        </span>
        {NICHOS_FREQUENTES.map((nicho) => {
          const ativo = nichoAtivo?.toLowerCase() === nicho.toLowerCase();
          return (
            <button
              key={nicho}
              onClick={() => alternarNicho(nicho)}
              className="px-3 text-xs font-medium rounded-[8px] transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                minHeight: "44px",
                background: ativo
                  ? "var(--color-violet)"
                  : "var(--color-violet-soft)",
                color: ativo ? "#fff" : "var(--color-violet-deep)",
                border: "none",
                cursor: "pointer",
              }}
              aria-pressed={ativo}
            >
              {nicho}
            </button>
          );
        })}
      </div>

      {/* Campo de busca por regiao */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="filtro-regiao"
          className="text-[10px] tracking-widest shrink-0"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-ink3)",
          }}
        >
          REGIAO
        </label>
        <input
          id="filtro-regiao"
          type="text"
          placeholder="ex: Nordeste, SP, RJ..."
          defaultValue={regiaoAtiva ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = (e.target as HTMLInputElement).value.trim();
              atualizar("regiao", val || undefined);
            }
          }}
          onBlur={(e) => {
            const val = e.target.value.trim();
            atualizar("regiao", val || undefined);
          }}
          className="flex-1 max-w-xs px-3 py-1.5 rounded-[8px] text-sm outline-none transition-colors"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            border: "1px solid var(--color-line)",
            background: "var(--color-card)",
            color: "var(--color-ink)",
            minHeight: "44px",
          }}
        />
        {temFiltroAtivo && (
          <button
            onClick={limparFiltros}
            className="text-xs px-3 py-1 rounded-[8px] transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-ink3)",
              border: "1px solid var(--color-line)",
              background: "transparent",
              cursor: "pointer",
              minHeight: "44px",
            }}
          >
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
