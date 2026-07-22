# ADR 0001 — Right-sizing do Handbook (freio-de-escopo)

**Data:** 2026-07-22
**Status:** Aceita
**Decisor:** Gabriel Quental (delegou a decisão ao Claude Code)

---

## Contexto

Um plano completo de handbook foi desenvolvido fora deste repo (no ChatGPT) e
trazido para execução: ~500 páginas, 80–120 arquivos, incluindo uma pasta
`07_AGENTS` documentando 9 agentes de IA "como funcionários" (CEO, PM, Growth,
Finance, CRM, Content, Knowledge, UX, Dev) com KPIs, memória e prompt base, mais
um `AgentCollaborationProtocol` (como agentes conversam, delegam, resolvem
conflitos).

## Problema

Lido à letra, o plano é o **Anti-Padrão #1** da FeelWorks (CLAUDE.md §6):
"expandir a tese antes de executar a tese". Cruza regras vigentes:

1. **CLAUDE.md §4** — o foco ABSOLUTO da Fase 1 é o Módulo de Oportunidades
   (Screen 10 + modelo do Lastro + claim mínimo). Nada disso está pronto. 500
   páginas antes disso é runway de fundador solo gasto no meta-nível.
2. **D10 + quarentena (§5)** — documentar um organograma de 9 agentes com
   protocolo de colaboração **é projetar** a arquitetura multi-agente que está
   em quarentena. Não é documentação neutra; é a rampa de acesso para construí-la.
3. Boa parte documenta produto que **não existe** (Analytics, Knowledge, matching)
   — spec de Fase 2/3 vestida de Fase 1.
4. Sinal da fonte: desenvolvido no GPT, que não tem esta constituição nem o freio
   do Anti-Padrão #1, e amplifica ambição por padrão (a "sereia" da §6).

## Decisão

**Right-size o handbook.** Ele é um ativo real, mas construído na hora certa, no
tamanho certo, documentando o que EXISTE e o que está DECIDIDO — não o que está
em quarentena.

### Escrevemos agora (documenta o que existe / está decidido)
- `00_FOUNDATION` — feito (Vision, Manifesto, Philosophy, Principles, ProductDNA,
  Terminology, MentalModels).
- Filosofia de produto: `DesignPsychology`, `InteractionPhilosophy`,
  `AttentionSystem`, `UXLaws` — descrevem como o produto deve *sentir*, não um
  sistema multi-agente.
- `05_ENGINEERING` — arquitetura hexagonal, folder structure, testing, git, ADR,
  review. Tudo real e útil para o Claude Code já.
- `06_AI_ENGINEERING` — **apenas** o agente único de extração que existe,
  `LoopEngineering` (estudo já mergeado), `ContextEngineering`,
  `MemoryEngineering`, `LivingContext`. **NÃO** `AgentEngineering` como multi-agente.
- `01_BRAND` / `03_DESIGN_SYSTEM` — a identidade que já existe (paper off-white,
  violeta #6C5BFF, Archivo, dados em mono).
- `11_DECISIONS`, `12_TEMPLATES`.

### Adiado (quarentena ou não existe)
- `07_AGENTS` (os 9 agentes com KPI/memória/prompt) — **gated por D10**.
- `AgentCollaborationProtocol` — orchestrator-workers, Fase 2+.
- `02_PRODUCT` conceitos inexistentes (Analytics, Knowledge, matching).

### Modo de crescimento
Incremental, **intercalado com o trabalho de produto da Fase 1** — nunca um push
de 500 páginas upfront. O Módulo de Oportunidades continua sendo o trilho.

## Gate de reabertura de `07_AGENTS`

Documentar/construir o sistema multi-agente só sai da quarentena quando os
critérios da reabertura consciente de D10 (ver `docs/decisoes/log.md` no repo do
produto) forem atingidos: volume real de oportunidades/mês, funcionalidades de
produto que dão o que orquestrar, e dataset de eval mostrando platô do agente
único. Se uma sessão futura citar este handbook para justificar construir os 9
agentes sem checar esses critérios, é o Anti-Padrão #1 de novo.

## Consequências

- A Foundation (PR #7) permanece — é defensável, consolida estratégia existente.
- O README deixa de anunciar o plano de 500 páginas / 9 agentes como roadmap
  sancionado.
- Nenhum código de produto muda. Nenhuma arquitetura multi-agente é projetada.

---

_ADR do FeelWorks Engineering Handbook. Prevalece sobre conversas de IA externas._
