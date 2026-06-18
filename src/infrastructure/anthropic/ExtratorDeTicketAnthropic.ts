import Anthropic from "@anthropic-ai/sdk";
import { ExtratorDeTicket } from "@dominio/ports/ExtratorDeTicket";
import {
  TicketExtraido,
  DadosTicketExtraido,
  OrigemCampo,
} from "@dominio/oportunidade/TicketExtraido";
import { Papel } from "@dominio/oportunidade/Papel";
import { FaixaSeguidores } from "@dominio/oportunidade/FaixaSeguidores";

// Adapter que implementa ExtratorDeTicket via API Anthropic.
// O dominio nao conhece a Anthropic — este arquivo e o unico ponto de acoplamento
// (CLAUDE.md secao 8, D10: um agente, uma chamada; D11: adapter na borda).
//
// O system prompt e o ativo central deste modulo (spec 05): construido iterativamente
// com briefings reais do Gabriel, nunca "finalizado" cedo. Esta versao inicial e
// um ponto de partida — ajustar com os primeiros briefings reais.

const SYSTEM_PROMPT = `Voce e um extrator estruturado de briefings de campanhas de marketing de influencia.

Dado um texto bruto (WhatsApp, e-mail, audio transcrito), extraia os campos abaixo em JSON valido.
Responda APENAS com o JSON — sem markdown, sem explicacoes, sem texto antes ou depois.

Schema esperado:
{
  "marca": string | null,
  "budget": number | null,          // valor numerico em reais, sem simbolo
  "prazo": string | null,           // ISO 8601 (YYYY-MM-DD) se possivel; null se nao mencionado
  "local": string | null,           // cidade/local do evento se mencionado
  "regiao": string | null,          // regiao geografica do publico (ex: "Nordeste", "SP")
  "entregaveis": string[],          // lista de entregaveis (ex: ["1 reels", "3 stories"])
  "papeis": [                       // um ou mais papeis no squad
    {
      "funcao": string,             // ex: "Creator de beleza", "Creator de lifestyle"
      "qtd": number,                // quantidade de pessoas neste papel (inteiro >= 1)
      "nicho": string | null,       // nicho especifico se mencionado
      "seguidoresMin": number | null,
      "seguidoresMax": number | null
    }
  ],
  "confianca": number,              // 0.0 a 1.0 — sua confianca na extracao (briefing raso = baixo)
  "origens": [                      // trechos que originaram cada campo
    { "campo": string, "trecho": string }
  ]
}

Regras:
- Se um campo nao foi mencionado, use null (nao invente).
- papeis NUNCA pode ser vazio: se nao houver papel claro, infira "Creator" com qtd=1 e confianca baixa.
- confianca reflete a riqueza do briefing: campos vazios reduzem o valor.
- origens: inclua o trecho exato do texto que originou cada campo nao-nulo.
- Nao use scores de 0 a 100 para qualidade de perfil ou reputacao — isso e proibido no sistema.`;

// Estrutura JSON que o modelo devolve — validada antes de montar o TicketExtraido
interface RespostaIA {
  marca: string | null;
  budget: number | null;
  prazo: string | null;
  local: string | null;
  regiao: string | null;
  entregaveis: string[];
  papeis: Array<{
    funcao: string;
    qtd: number;
    nicho: string | null;
    seguidoresMin: number | null;
    seguidoresMax: number | null;
  }>;
  confianca: number;
  origens: Array<{ campo: string; trecho: string }>;
}

function validarResposta(raw: unknown): RespostaIA {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("ExtratorDeTicketAnthropic: resposta nao e um objeto.");
  }
  const r = raw as Record<string, unknown>;

  if (!Array.isArray(r.papeis) || r.papeis.length === 0) {
    throw new Error(
      "ExtratorDeTicketAnthropic: resposta sem papeis (campo obrigatorio).",
    );
  }
  const confianca =
    typeof r.confianca === "number" ? r.confianca : parseFloat(String(r.confianca));
  if (Number.isNaN(confianca) || confianca < 0 || confianca > 1) {
    throw new Error(
      "ExtratorDeTicketAnthropic: confianca deve estar entre 0 e 1.",
    );
  }

  return {
    marca: typeof r.marca === "string" ? r.marca : null,
    budget: typeof r.budget === "number" ? r.budget : null,
    prazo: typeof r.prazo === "string" ? r.prazo : null,
    local: typeof r.local === "string" ? r.local : null,
    regiao: typeof r.regiao === "string" ? r.regiao : null,
    entregaveis: Array.isArray(r.entregaveis)
      ? (r.entregaveis as string[]).filter((e) => typeof e === "string")
      : [],
    papeis: (r.papeis as Record<string, unknown>[]).map((p) => ({
      funcao: typeof p.funcao === "string" ? p.funcao : "Creator",
      qtd: typeof p.qtd === "number" && p.qtd >= 1 ? Math.round(p.qtd) : 1,
      nicho: typeof p.nicho === "string" ? p.nicho : null,
      seguidoresMin: typeof p.seguidoresMin === "number" ? p.seguidoresMin : null,
      seguidoresMax: typeof p.seguidoresMax === "number" ? p.seguidoresMax : null,
    })),
    confianca,
    origens: Array.isArray(r.origens)
      ? (r.origens as Record<string, unknown>[])
          .filter((o) => typeof o.campo === "string" && typeof o.trecho === "string")
          .map((o) => ({ campo: o.campo as string, trecho: o.trecho as string }))
      : [],
  };
}

function montarTicket(resposta: RespostaIA, textoBruto: string): TicketExtraido {
  const papeis = resposta.papeis.map((p) => {
    const faixa =
      p.seguidoresMin !== null
        ? FaixaSeguidores.criar(
            p.seguidoresMin,
            p.seguidoresMax ?? undefined,
          )
        : undefined;
    return Papel.criar({
      funcao: p.funcao,
      qtd: p.qtd,
      nicho: p.nicho ?? undefined,
      faixaSeguidores: faixa,
    });
  });

  const origens: OrigemCampo[] = [
    { campo: "textoBruto", trecho: textoBruto },
    ...resposta.origens,
  ];

  const dados: DadosTicketExtraido = {
    papeis,
    confianca: resposta.confianca,
    marca: resposta.marca ?? undefined,
    budget: resposta.budget ?? undefined,
    prazo: resposta.prazo ? new Date(resposta.prazo) : undefined,
    local: resposta.local ?? undefined,
    regiao: resposta.regiao ?? undefined,
    entregaveis: resposta.entregaveis,
    origens,
  };

  return TicketExtraido.criar(dados);
}

export class ExtratorDeTicketAnthropic implements ExtratorDeTicket {
  private readonly client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ExtratorDeTicketAnthropic: ANTHROPIC_API_KEY nao configurada.",
      );
    }
    this.client = new Anthropic({ apiKey });
  }

  async extrair(textoBruto: string): Promise<TicketExtraido> {
    const mensagem = await this.client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: textoBruto }],
    });

    const bloco = mensagem.content[0];
    if (bloco.type !== "text") {
      throw new Error(
        "ExtratorDeTicketAnthropic: resposta sem bloco de texto.",
      );
    }

    let raw: unknown;
    try {
      raw = JSON.parse(bloco.text);
    } catch {
      throw new Error(
        `ExtratorDeTicketAnthropic: JSON invalido na resposta — ${bloco.text.slice(0, 200)}`,
      );
    }

    const resposta = validarResposta(raw);
    return montarTicket(resposta, textoBruto);
  }
}
