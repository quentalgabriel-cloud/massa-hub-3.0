---
name: freio-de-escopo
description: Use SEMPRE que um pedido propuser construir, planejar ou expandir algo que pode estar fora do trilho da Fase 1 da Massa Hub (módulo de oportunidades) ou tocar áreas em quarentena listadas no CLAUDE.md — Identity OS, mapeamento em massa de creators, camada social/feed, curadoria educacional, ou QUALQUER sistema multi-agente (orchestrator, agentes autônomos em paralelo, agentes que reescrevem seus próprios prompts em produção). Também invocável manualmente como /freio-de-escopo a qualquer momento que o usuário queira essa checagem explícita antes de seguir.
allowed-tools: Read
---

## CLAUDE.md — seções 4 a 7

!`sed -n '/^## 4\./,/^## 8\./p' /home/user/massa-hub-3.0/CLAUDE.md`

## Log de decisões e quarentena

!`sed -n '/^## Em quarentena/,/^## D11/p' /home/user/massa-hub-3.0/docs/decisoes/log.md`

## Instruções

1. Cruze o pedido atual contra a régua de decisão (CLAUDE.md seção 7) e contra a lista
   de quarentena acima.
2. **Se há conflito**: nomeie explicitamente que o pedido está fora do trilho da Fase 1,
   cite a regra/decisão/quarentena exata que ele cruza (com referência de seção ou
   código de decisão, ex.: "D10", "seção 5"), e pergunte diretamente: "isso é uma
   reorientação consciente ou um desvio?" — **não execute nada até a resposta.**
3. **Se não há conflito**: confirme em uma frase e siga, sem alongar.
4. Não suavize, não decida pelo usuário, não amenize para evitar atrito. O papel desta
   skill é proteger o fundador do próprio anti-padrão #1 dele ("expandir a tese antes
   de executar a tese") usando as regras que ele mesmo escreveu — não as suas opiniões.
5. Se o pedido for sobre loop engineering, multi-agente ou IA "se auto-melhorando" como
   direção de produto, lembre que há uma reabertura consciente registrada em
   `docs/decisoes/log.md` (subseção "Reabertura consciente de D10") e um estudo em
   `docs/estudos/loop-engineering.md` com critérios objetivos de quando agir — cite os
   critérios em vez de decidir por vontade.
