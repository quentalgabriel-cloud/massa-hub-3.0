// Esqueleto de eval evaluator-optimizer (humano como optimizer) sobre o ÚNICO
// adapter de IA do produto. Não é multi-agente, não é DSPy — ver eval/README.md.
//
// Roda contra a API Anthropic real (custo, latência, não-determinismo). Por isso
// fica fora do Vitest e do `npm test`: só executa sob comando explícito.
//
// Uso: npm run eval:ticket  (requer ANTHROPIC_API_KEY)

import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ExtratorDeTicketAnthropic } from "../../src/infrastructure/anthropic/ExtratorDeTicketAnthropic";
import type { TicketExtraido } from "../../src/domain/oportunidade/TicketExtraido";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "fixtures");

interface PapelEsperado {
  qtdMinima?: number;
  seguidoresMinEsperado?: number;
  seguidoresMaxEsperado?: number;
}

interface Fixture {
  id: string;
  descricao: string;
  textoBruto: string;
  esperado: {
    marca?: string | null;
    budget?: number | null;
    local?: string | null;
    regiao?: string | null;
    entregaveis?: string[];
    papeis?: PapelEsperado[];
    papeisMinimo?: number;
    confiancaMinima?: number;
    confiancaMaxima?: number;
  };
}

interface Divergencia {
  campo: string;
  esperado: unknown;
  obtido: unknown;
}

function normalizarTexto(valor: string | undefined | null): string {
  return (valor ?? "").trim().toLowerCase();
}

function compararCampoTexto(
  campo: string,
  esperado: string | null | undefined,
  obtido: string | undefined,
  divergencias: Divergencia[],
): void {
  if (esperado === undefined) return;
  if (normalizarTexto(esperado) !== normalizarTexto(obtido)) {
    divergencias.push({ campo, esperado, obtido });
  }
}

function avaliar(fixture: Fixture, ticket: TicketExtraido): Divergencia[] {
  const divergencias: Divergencia[] = [];
  const { esperado } = fixture;

  compararCampoTexto("marca", esperado.marca, ticket.marca, divergencias);
  compararCampoTexto("local", esperado.local, ticket.local, divergencias);
  compararCampoTexto("regiao", esperado.regiao, ticket.regiao, divergencias);

  if (esperado.budget !== undefined && esperado.budget !== (ticket.budget ?? null)) {
    divergencias.push({ campo: "budget", esperado: esperado.budget, obtido: ticket.budget });
  }

  if (esperado.entregaveis !== undefined) {
    const faltantes = esperado.entregaveis.filter(
      (e) => !ticket.entregaveis.some((o) => normalizarTexto(o) === normalizarTexto(e)),
    );
    if (faltantes.length > 0) {
      divergencias.push({ campo: "entregaveis", esperado: esperado.entregaveis, obtido: ticket.entregaveis });
    }
  }

  const minimoPapeis = esperado.papeisMinimo ?? esperado.papeis?.length ?? 0;
  if (ticket.papeis.length < minimoPapeis) {
    divergencias.push({ campo: "papeis.length", esperado: `>= ${minimoPapeis}`, obtido: ticket.papeis.length });
  }
  if (ticket.papeis.length === 0) {
    divergencias.push({ campo: "papeis", esperado: "nunca vazio (regra de dominio)", obtido: [] });
  }

  if (esperado.confiancaMinima !== undefined && ticket.confianca < esperado.confiancaMinima) {
    divergencias.push({ campo: "confianca", esperado: `>= ${esperado.confiancaMinima}`, obtido: ticket.confianca });
  }
  if (esperado.confiancaMaxima !== undefined && ticket.confianca > esperado.confiancaMaxima) {
    divergencias.push({ campo: "confianca", esperado: `<= ${esperado.confiancaMaxima}`, obtido: ticket.confianca });
  }

  return divergencias;
}

async function main(): Promise<void> {
  const arquivos = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith(".json"));
  const extrator = new ExtratorDeTicketAnthropic();

  let passaram = 0;
  const total = arquivos.length;

  for (const arquivo of arquivos) {
    const fixture: Fixture = JSON.parse(readFileSync(join(FIXTURES_DIR, arquivo), "utf-8"));
    console.log(`\n--- ${fixture.id} ---`);
    console.log(fixture.descricao);

    try {
      const ticket = await extrator.extrair(fixture.textoBruto);
      const divergencias = avaliar(fixture, ticket);

      if (divergencias.length === 0) {
        console.log("PASSOU");
        passaram++;
      } else {
        console.log("DIVERGIU:");
        for (const d of divergencias) {
          console.log(`  - ${d.campo}: esperado=${JSON.stringify(d.esperado)} obtido=${JSON.stringify(d.obtido)}`);
        }
      }
    } catch (erro) {
      console.log(`ERRO ao extrair: ${(erro as Error).message}`);
    }
  }

  console.log(`\n=== Resumo: ${passaram}/${total} passaram ===`);
  process.exit(passaram === total ? 0 : 1);
}

main();
