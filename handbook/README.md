# FeelWorks Engineering Handbook

> A constituição viva da FeelWorks — referência de como a empresa pensa, projeta e
> constrói. Inspiração: Stripe/Linear/Shopify handbooks, mas para uma plataforma
> nativamente orientada por IA.

Este handbook não é documentação secundária. Quando alguém (especialmente o Claude
Code) o abre, não aprende telas — aprende **como a FeelWorks pensa**.

---

## ⚠️ Regra de escopo (leia antes de expandir)

Este handbook documenta **o que EXISTE e o que está DECIDIDO** — nunca arquitetura
em quarentena como se fosse sancionada. Ele cresce **incremental, intercalado com o
trabalho de produto da Fase 1**, jamais num push de centenas de páginas upfront.

O foco ABSOLUTO do produto continua sendo o **Módulo de Oportunidades** (CLAUDE.md
§4). O handbook não compete com esse trilho — ele o serve.

Ver [ADR 0001 — Right-sizing](./docs/11_DECISIONS/0001-handbook-right-sizing.md)
para o porquê. **`07_AGENTS` e protocolos multi-agente estão adiados** (D10 /
quarentena), gated pelos critérios de reabertura em `docs/decisoes/log.md`.

---

## Navegação

### [00 — Foundation](./docs/00_FOUNDATION/) ✅
Como a FeelWorks pensa. Mental models, princípios, essência.
- [Vision](./docs/00_FOUNDATION/Vision.md) — O que somos
- [Manifesto](./docs/00_FOUNDATION/Manifesto.md) — Valores
- [Philosophy](./docs/00_FOUNDATION/Philosophy.md) — Como pensamos
- [Principles](./docs/00_FOUNDATION/Principles.md) — Critérios de decisão
- [ProductDNA](./docs/00_FOUNDATION/ProductDNA.md) — Essência imutável
- [Terminology](./docs/00_FOUNDATION/Terminology.md) — Dicionário
- [MentalModels](./docs/00_FOUNDATION/MentalModels.md) — 6 mentalidades

### Próximos (documentam o que existe / está decidido)
- **04_UX** — DesignPsychology, InteractionPhilosophy, AttentionSystem, UXLaws
- **05_ENGINEERING** — arquitetura hexagonal, testing, git, ADR, review
- **06_AI_ENGINEERING** — o agente único de extração, LoopEngineering (mergeado),
  ContextEngineering, MemoryEngineering, LivingContext
- **01_BRAND / 03_DESIGN_SYSTEM** — a identidade visual que já existe
- **11_DECISIONS / 12_TEMPLATES**

### Adiado (gated por D10 / quarentena)
- **07_AGENTS** — organograma de agentes de IA. Só quando os critérios de
  reabertura de D10 forem atingidos.
- **AgentCollaborationProtocol** — orchestrator multi-agente. Fase 2+.
- **02_PRODUCT** conceitos que ainda não existem (Analytics, Knowledge, matching).

---

## Propósito

- 🎓 Onboarding de desenvolvedores
- 🤖 Contexto para o Claude Code durante o desenvolvimento
- 🏗️ Revisão de arquitetura
- 🎨 Padronização de UX/UI
- 📖 Documentação viva do produto
- ⚖️ Governança técnica e tomada de decisão

---

## Como ler

**Claude Code:** comece por `00_FOUNDATION`, leia `MentalModels` com atenção,
depois a seção relevante à tarefa. Sempre cruze decisões com `Principles.md` e com
a regra de escopo acima.

**Novos membros:** Vision + Manifesto (15 min) → Philosophy + Principles (30 min)
→ MentalModels (30 min) → seção da sua função.

---

## Status

- ✅ **Foundation:** completa (PR #7)
- 🔄 **Próximas seções:** incrementais, intercaladas com a Fase 1 do produto
- 🚫 **07_AGENTS e multi-agente:** adiados (D10)

---

_Última atualização: julho/2026. Ver ADR 0001 para a regra de escopo._
