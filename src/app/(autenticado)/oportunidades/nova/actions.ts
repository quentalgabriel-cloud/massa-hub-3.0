"use server";

import { z } from "zod";
import { ExtrairTicket } from "@aplicacao/ExtrairTicket";
import { PublicarOportunidade } from "@aplicacao/PublicarOportunidade";
import { ExtratorDeTicketAnthropic } from "@infra/anthropic/ExtratorDeTicketAnthropic";
import { TicketExtraido } from "@dominio/oportunidade/TicketExtraido";
import { usuarioAtual } from "@infra/supabase/auth";

// Tipo serializado do TicketExtraido para atravessar a fronteira Server→Client.
// Datas viram string ISO; Papel mantem apenas campos primitivos.
export interface TicketSerializado {
  marca?: string;
  budget?: number;
  prazo?: string;
  local?: string;
  regiao?: string;
  entregaveis: string[];
  confianca: number;
  papeis: Array<{
    funcao: string;
    qtd: number;
    nicho?: string;
    seguidoresMin?: number;
    seguidoresMax?: number;
  }>;
  origens: Array<{ campo: string; trecho: string }>;
}

function serializarTicket(ticket: TicketExtraido): TicketSerializado {
  return {
    marca: ticket.marca,
    budget: ticket.budget,
    prazo: ticket.prazo?.toISOString().split("T")[0],
    local: ticket.local,
    regiao: ticket.regiao,
    entregaveis: [...ticket.entregaveis],
    confianca: ticket.confianca,
    papeis: ticket.papeis.map((p) => ({
      funcao: p.funcao,
      qtd: p.qtd,
      nicho: p.nicho,
      seguidoresMin: p.faixaSeguidores?.min,
      seguidoresMax: p.faixaSeguidores?.max,
    })),
    origens: [...ticket.origens],
  };
}

type Resultado<T> = { ok: true; dados: T } | { ok: false; erro: string };

const schemaExtrair = z.object({
  textoBruto: z.string().min(10, "Briefing muito curto."),
});

export async function extrairTicket(
  formData: FormData,
): Promise<Resultado<TicketSerializado>> {
  // Identidade vem da sessao, nunca do cliente (Ciclo 5).
  const usuario = await usuarioAtual();
  if (!usuario) return { ok: false, erro: "Sessao expirada. Entre novamente." };

  const parsed = schemaExtrair.safeParse({
    textoBruto: formData.get("textoBruto"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.errors[0].message };
  }

  try {
    const extrator = new ExtratorDeTicketAnthropic();
    const caso = new ExtrairTicket(extrator);
    const ticket = await caso.executar({
      textoBruto: parsed.data.textoBruto,
      autorId: usuario.id,
    });
    return { ok: true, dados: serializarTicket(ticket) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido.";
    return { ok: false, erro: msg };
  }
}

const schemaPublicar = z.object({
  textoBruto: z.string().min(1),
  ticket: z.string().min(1), // JSON serializado do TicketSerializado
});

export async function publicarOportunidade(
  formData: FormData,
): Promise<Resultado<{ id: string }>> {
  // Autor = usuario autenticado (sessao), nunca um id vindo do cliente (Ciclo 5).
  const usuario = await usuarioAtual();
  if (!usuario) return { ok: false, erro: "Sessao expirada. Entre novamente." };

  const parsed = schemaPublicar.safeParse({
    textoBruto: formData.get("textoBruto"),
    ticket: formData.get("ticket"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.errors[0].message };
  }

  let ticketJson: TicketSerializado;
  try {
    ticketJson = JSON.parse(parsed.data.ticket) as TicketSerializado;
  } catch {
    return { ok: false, erro: "Ticket invalido. Extraia novamente." };
  }

  try {
    // Reconstroi o TicketExtraido a partir do JSON serializado
    const { Papel } = await import("@dominio/oportunidade/Papel");
    const { FaixaSeguidores } = await import(
      "@dominio/oportunidade/FaixaSeguidores"
    );

    const papeis = ticketJson.papeis.map((p) =>
      Papel.criar({
        funcao: p.funcao,
        qtd: p.qtd,
        nicho: p.nicho,
        faixaSeguidores:
          p.seguidoresMin !== undefined
            ? FaixaSeguidores.criar(
                p.seguidoresMin,
                p.seguidoresMax,
              )
            : undefined,
      }),
    );

    const ticket = TicketExtraido.criar({
      papeis,
      confianca: ticketJson.confianca,
      marca: ticketJson.marca,
      budget: ticketJson.budget,
      prazo: ticketJson.prazo ? new Date(ticketJson.prazo) : undefined,
      local: ticketJson.local,
      regiao: ticketJson.regiao,
      entregaveis: ticketJson.entregaveis,
      origens: ticketJson.origens,
    });

    // ID gerado no servidor — crypto.randomUUID e disponivel no edge runtime
    const id = crypto.randomUUID();

    const { OportunidadeRepositorioSupabase } = await import(
      "@infra/supabase/OportunidadeRepositorioSupabase"
    );
    const repositorio = new OportunidadeRepositorioSupabase();
    const caso = new PublicarOportunidade(repositorio);

    await caso.executar({
      id,
      autorId: usuario.id,
      ticket,
      textoBruto: parsed.data.textoBruto,
      revisadoPeloAutor: true,
    });

    return { ok: true, dados: { id } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido.";
    return { ok: false, erro: msg };
  }
}
