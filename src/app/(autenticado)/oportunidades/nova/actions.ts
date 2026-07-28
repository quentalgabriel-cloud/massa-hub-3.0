"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ExtrairTicket } from "@aplicacao/ExtrairTicket";
import { PublicarOportunidade } from "@aplicacao/PublicarOportunidade";
import { ExtratorDeTicketAnthropic } from "@infra/anthropic/ExtratorDeTicketAnthropic";
import { criarClienteSSR } from "@infra/supabase/cliente";
import { TicketExtraido } from "@dominio/oportunidade/TicketExtraido";
import type { User } from "@supabase/supabase-js";

// Garante que o assessor logado tem um Perfil REAL (o no da rede) e devolve o
// perfil.id. Fecha o fio solto da Fase 1: as acoes usavam user.id (id de auth)
// no lugar do perfilId. Provisiona no primeiro uso, sem onboarding — o handle
// sai do nome/e-mail do Google. Idempotente (get-or-create).
async function garantirPerfilAssessorId(user: User): Promise<string> {
  const { GarantirPerfilDoAssessor } = await import(
    "@aplicacao/GarantirPerfilDoAssessor"
  );
  const { PerfilRepositorioSupabase } = await import(
    "@infra/supabase/PerfilRepositorioSupabase"
  );
  const caso = new GarantirPerfilDoAssessor(new PerfilRepositorioSupabase());
  const nome =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "";
  const perfil = await caso.executar({
    usuarioId: user.id,
    nome,
    email: user.email ?? undefined,
    perfilId: crypto.randomUUID(),
  });
  return perfil.id;
}

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
  autorId: z.string().min(1),
});

export async function extrairTicket(
  formData: FormData,
): Promise<Resultado<TicketSerializado>> {
  const parsed = schemaExtrair.safeParse({
    textoBruto: formData.get("textoBruto"),
    autorId: formData.get("autorId"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.errors[0].message };
  }

  try {
    const extrator = new ExtratorDeTicketAnthropic();
    const caso = new ExtrairTicket(extrator);
    const ticket = await caso.executar(parsed.data);
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
  // Identidade vem da SESSAO (servidor), nunca do FormData — nao confiar no cliente.
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sessao expirada. Entre novamente." };

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

    // O autor da oportunidade e o Perfil do assessor (o no da rede), nao o id
    // de auth. Provisionado aqui se ainda nao existir.
    const autorPerfilId = await garantirPerfilAssessorId(user);

    await caso.executar({
      id,
      autorId: autorPerfilId,
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

// Forma serializada do Perfil vinculado para atravessar Server→Client.
export interface PerfilVinculado {
  id: string;
  nome: string;
  handle: string;
  estado: "reivindicado" | "pendente";
  criouPerfil: boolean;
}

const schemaVincular = z.object({
  oportunidadeId: z.string().min(1),
  nome: z.string().min(1, "Informe o nome do creator."),
  handle: z.string().min(1, "Informe o handle do creator."),
});

// Vincula um creator da rede do assessor ao squad de uma oportunidade JA
// publicada — a porta de entrada do claim profile (spec 03). O creator entra
// PELA oportunidade (D7), nunca por cadastro em massa. Reusa o caso de uso
// VincularCreatorAoSquad (chaveado por handle: cria pendente novo ou reusa
// existente). A identidade do assessor vem da SESSAO, nunca do cliente.
export async function vincularCreator(
  formData: FormData,
): Promise<Resultado<PerfilVinculado>> {
  const supabase = await criarClienteSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sessao expirada. Entre novamente." };

  const parsed = schemaVincular.safeParse({
    oportunidadeId: formData.get("oportunidadeId"),
    nome: formData.get("nome"),
    handle: formData.get("handle"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.errors[0].message };
  }

  try {
    const { VincularCreatorAoSquad } = await import(
      "@aplicacao/VincularCreatorAoSquad"
    );
    const { PerfilRepositorioSupabase } = await import(
      "@infra/supabase/PerfilRepositorioSupabase"
    );
    const { OportunidadeRepositorioSupabase } = await import(
      "@infra/supabase/OportunidadeRepositorioSupabase"
    );

    const caso = new VincularCreatorAoSquad(
      new PerfilRepositorioSupabase(),
      new OportunidadeRepositorioSupabase(),
    );

    // O assessor vincula com o id do SEU Perfil (o mesmo que autorId da
    // oportunidade), nao o id de auth — senao o guard "so o autor vincula"
    // (VincularCreatorAoSquad) rejeitaria.
    const assessorPerfilId = await garantirPerfilAssessorId(user);

    const { perfil, criouPerfil } = await caso.executar({
      oportunidadeId: parsed.data.oportunidadeId,
      assessorId: assessorPerfilId,
      handle: parsed.data.handle,
      nome: parsed.data.nome,
      perfilId: crypto.randomUUID(), // usado so se um pendente novo for criado
    });

    // A candidatura entrou na oportunidade — invalida a pagina de detalhe.
    revalidatePath(`/oportunidades/${parsed.data.oportunidadeId}`);

    return {
      ok: true,
      dados: {
        id: perfil.id,
        nome: perfil.nome,
        handle: perfil.handle.valor,
        estado: perfil.estado,
        criouPerfil,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido.";
    return { ok: false, erro: msg };
  }
}
