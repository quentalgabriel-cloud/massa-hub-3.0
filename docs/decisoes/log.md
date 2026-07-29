# Decisões & Anti-padrões (log)

Registro do que já foi decidido para não reabrir por engano. Quando o Claude Code
ou eu propusermos algo que contraria isto, este log prevalece.

## Decididas

| # | Decisão | Por quê |
|---|---------|---------|
| D1 | Reputação = Lastro (fatos), nunca score numérico | Score com base rala é vazio e intimidante; emerge de evidência, não de cálculo |
| D2 | Prova bilateral é a unidade atômica | Análogo ao commit co-autorado; difícil de forjar; popula o grafo |
| D3 | Ritmo (heatmap) é a assinatura visual | Comunica confiança visceralmente, como o contribution graph |
| D4 | Assessor como cavalo de Troia, com categoria própria | Super-nó que destrava os outros 3 públicos |
| D5 | Monetização: quem contrata paga; creator grátis sempre | Garante supply side; preserva proposta de reputação |
| D6 | Sem ads, sem destaque pago, sem venda de dados | Conflitam com reputação verificável |
| D7 | Claim profile só ancorado em trabalho real | Evita base degradável de perfis fantasma |
| D8 | Fase 1 = só módulo de oportunidades | Único valor single-player antes de densidade |
| D9 | Lançamento SLC, não MVP cru | Rede precisa parecer viva no dia 1 |
| D10 | IA = um agente, uma chamada (não multi-agente) | Multi-agente resolve escala inexistente; gatilho do anti-padrão #1 |
| D11 | Repo/Supabase/Vercel novos; Supabase como adapter | Começo limpo; hexagonal honesta; domínio não conhece o banco |

## Em quarentena (não executar nesta fase)

- Identity OS (pipeline multi-agente) — expansão de tese antes de execução.
- Mapeamento em massa de creators via skill — base degradável; alavanca da fase 2.
- Camada social (feed/conexões) — fase 2.
- Curadoria educacional e clube de ferramentas — fase 3.
- **Sistema multi-agente (orchestrator + agentes autônomos)** — ver D10 abaixo.

## D10 — IA na Fase 1 é um agente, uma chamada (não multi-agente)

Decisão: a extração de ticket é UMA chamada de IA, isolada num adapter. NÃO construir
sistema multi-agente (orchestrator, research/memory/action agents, execução paralela).

Por quê: multi-agente resolve um problema de escala que não existe com ~19 perfis. É
a mesma sereia do Identity OS com roupa nova (gatilho do anti-padrão #1). Conteúdo de
engajamento ("o futuro é times de IA") não é roadmap.

O que aproveitar: o conceito de **pipeline** (extrair → validar → match → notificar)
é útil como arquitetura mental para a fase 2+ — mas como pipeline determinístico e
testável, com a IA entrando em pontos específicos, NÃO como enxame de agentes
autônomos. Pipeline você controla e testa; enxame você reza pra funcionar.

Quando reavaliar: fase 2+, com volume real de oportunidades circulando.

### Reabertura consciente de D10 (2026-06-21)

A pedido do fundador, em 2026-06-21, D10 foi revisitada conscientemente — não por
desvio silencioso, mas por pedido explícito de estudar loop engineering e avaliar
loop/multi-agente como possível direção de produto/infra. Isto fica registrado para
distinguir uma reabertura deliberada de uma violação por engano.

Status: **D10 permanece válida e em vigor agora.** Esta nota não a substitui nem
suspende.

O que muda / o que não muda: nenhum código ou escopo construído muda. O que passa a
existir é um documento de referência (`docs/estudos/loop-engineering.md`) com critérios
objetivos de quando reavaliar, em vez de "nunca mais falar disso" ou um "depois"
indefinido.

Critérios objetivos de reavaliação (detalhados na seção 7 do estudo):
- Volume de oportunidades/mês processadas pelo agente único, suficiente para o gargalo
  visível deixar de ser throughput de cadastro e passar a ser precisão/cobertura.
- Existência de funcionalidades de produto que dão o que orquestrar (matching por
  Lastro, verificação cruzada, negociação) — hoje nenhuma delas existe.
- Dataset de eval (`eval/ticket/`) mostrando platô de qualidade do agente único — só
  então "adicionar uma segunda cabeça" tem ROI mensurável em vez de ser estética de
  arquitetura.

Isto é uma discussão aberta com critério de reabertura, não uma decisão de construir
multi-agente. Se uma sessão futura citar esta nota para justificar construção direta
sem checar os critérios acima, é o anti-padrão #1 de novo.

Ver `docs/estudos/loop-engineering.md` para o estudo completo.

## D11 — Repo, Supabase e Vercel novos e isolados

Decisão: começar do zero, projetos novos. Supabase entra como adapter de repositório,
nunca no domínio. Modelar domínio antes do schema. Elimina resíduo de Identity OS e
mantém a hexagonal honesta desde o dia 1.

## Anti-padrão nomeado #1

**Expandir a tese antes de executar a tese.** Histórico: Identity OS virou
"infraestrutura existencial"; um dashboard de produtividade colapsou 4 modelos de
negócio. É o maior risco do projeto. O Claude Code deve sinalizar em tempo real
quando um pedido sair do trilho da Fase 1.

## Sobre os protótipos desta fase de design

Foram criados 3 artefatos HTML (proposta visual, protótipo navegável, cockpit de
produção). **São artefatos de comunicação, não código de produção.** Não portar o
HTML para o Next.js — portar as *decisões de design* que eles carregam (estas specs).
O produto é Next.js + arquitetura hexagonal; os protótipos são vanilla single-file.

**Exceção importante — Screen 10 já tem protótipo funcional:** existe um React com
extração real via API Anthropic (ver docs/specs/05-prototipo-screen10.md). Dele se
porta o contrato de dados e a lógica de extração, não o componente. Decisões já
tomadas: realce de origem, ticket squad-aware, campo de confiança, match por Lastro
ilustrativo. Não reinventar.

## Parcerias em avaliação (contexto, não escopo de código)

- TKI Tecnologia (gateway white label): NÃO como fornecedor agora. Rafael (consultor)
  como possível conector de pipeline — teste de indicação mútua por 90 dias, sem
  formalizar, com filtro de reputação ligado.
- Korun/Gabi: piloto de camada de reputação, co-branded ("Massa Reputação powered by
  Korun"), 20–30 perfis, 60–90 dias. Não deslocar o módulo de oportunidades.

## Deadline de referência

YOUPIX Summit 2026 (29/set, SP) é o go/no-go do ano. Pagamento do estande até
jul/2026. Critérios: módulo de oportunidades em beta com 20–50 oportunidades reais,
200–500 perfis (concentração em assessores), 2–3 agências testando, 3–5 parcerias.
Se não atingir: ir como visitante, mirar 2027.

## D12 — Provedor de IA continua Anthropic (Haiku); critério de reavaliação registrado

Contexto: fundador pediu pesquisa de alternativa gratuita/mais barata (incl. modelo
chinês) para a extração de ticket, com a meta de "atender a demanda inicial mas
deixar preparado para evoluir".

Pesquisa (web, jul/2026): "grátis" quase sempre significa que o provedor treina em
cima dos seus prompts — e o que mandamos pra extração é dado sensível real (marca,
budget, nomes de creator). API oficial da DeepSeek processa e armazena na China, ToS
permite treinar nos dados, e já foi restringida em governos (Itália, Austrália,
Taiwan, Coreia do Sul) por isso — inadequada para dado de cliente. É possível rodar
modelos chineses (Qwen/DeepSeek) via host ocidental (ex. Groq, SOC 2) sem esse risco,
mas isso ainda seria trocar de adapter por uma economia irrelevante no volume atual
(~50 oportunidades/mês custam centavos no Haiku).

Decisão: manter Claude Haiku como provedor da Fase 1. Não construir abstração
multi-provedor agora — a porta `ExtratorDeTicket` (D11, hexagonal) já torna uma troca
futura um novo adapter + uma linha na composição, sem tocar domínio/aplicação. Prédio
especulativo de "seleção de provedor por config" antes de existir um segundo provedor
real seria o anti-padrão #1 em código.

Preparação de baixo custo feita agora (sem abstração nova):
- Nome do modelo saiu do hardcode → `ANTHROPIC_MODEL` (env var, default Haiku atual).
  Testar um modelo novo vira config, não deploy de código.
- Log estruturado por extração (`evento: "extracao_ticket"`): confiança, latência,
  tokens de entrada/saída — greppável nos runtime logs do Vercel.

Critério objetivo de reavaliação (mesmo espírito da reabertura do D10 — dado, não
vontade): revisitar o provedor quando os logs acima mostrarem confiança média
caindo, ou quando o volume real de oportunidades tornar o custo (não mais centavos)
uma variável que importa. Até lá, esta decisão permanece.

## D13 — Abertura da Fase 2 (2026-07-28)

Decisão do fundador: encerrar a Fase 1 e abrir a Fase 2. Motivo declarado —
**investidor e usuários de teste aguardando a rede utilizável**. Registrado como
reorientação consciente, não desvio silencioso (protocolo da seção 6).

Contexto no momento da decisão, para honestidade histórica: a Fase 1 estava
**construída e em produção**, mas **não executada** — banco em 0 linhas (0 perfis,
0 oportunidades, 0 provas) e o fluxo autenticado (login → extração por IA →
publicar → vincular → reivindicar) nunca completado nem uma vez. O critério de
sucesso da spec 02 ("o assessor usou a Massa pra estruturar uma oportunidade
real") não foi atingido. O freio de escopo apontou isso; o fundador reafirmou com
o motivo de negócio acima e a decisão é dele.

**Risco assumido e nomeado:** com investidor e testadores olhando, um fluxo
principal que nunca rodou é risco de exposição maior do que seria com o produto
fechado. A primeira execução real do fluxo continua sendo o item de maior valor
por minuto investido — não como bloqueio, mas como prioridade.

O que a abertura da Fase 2 muda:
- Saem da quarentena: camada social, mapeamento assistido de creators, matching
  por Lastro, ativação por e-mail, onboarding de quem chega sozinho.
- **Não** sai da quarentena: multi-agente (D10 tem critérios próprios, todos em
  zero), Identity OS, curadoria educacional (fase 3), escopo fora da economia
  criativa.
- **Não** se suspende: D1 (Lastro, nunca score), D7 (nenhum perfil sem âncora de
  trabalho real), seção 2 (o que a Massa não é), regras de monetização.

Sobre o mecanismo: o freio de escopo **não foi removido**. Ele lê o CLAUDE.md —
com a fase atualizada, deixa de disparar para escopo de Fase 2 e segue protegendo
o que continua fora. Remover a skill teria deixado o CLAUDE.md dizendo "Fase 1" e
recriado o atrito a cada sessão nova.
