# Principles — Critérios de Decisão da FeelWorks

## Propósito

Estas são as regras que arbitram conflitos e guiam todas as decisões.

Quando há dúvida, **volta-se aos Principles**.

Audiência: Todos (especialmente decisões produto, design, engenharia).

---

## P1: Verificabilidade > Escala

**Se precisamos escolher entre verificar e crescer, verificamos.**

- Não criamos perfis sem prova de trabalho
- Não publicamos reputação sem lastro
- Deixamos usuário esperando a coletar dados verificáveis

Mais vale 100 verificados que 1.000 em dúvida.

---

## P2: Contexto > Simplicidade

**Sempre que há conflito entre "UI simples" e "informação contextualizada", escolhemos contexto.**

- Card grande revelando contexto > campo escondido economizando espaço
- Workflow em 5 telas com contexto > 1 tela genérica confusa
- Pergunta adicional se ela muda a decisão > ignorar a pergunta

---

## P3: Pessoa no Loop > Automação Completa

**IA nunca decide sozinha.**

- Sugestão com opção sempre
- Automação se pessoa pediu + confirmação
- Veto humano em tudo

---

## P4: Fatos > Interpretações

**Dados brutos > algoritmo opaco.**

- Mostrar o número de provas (fato) em vez de "score de confiança" (interpretação)
- Mostrar quem recomendou (fato) em vez de "relevância calculada" (interpretação)
- Aceitar que fatos às vezes são ambuígos (não forçar clareza artificial)

---

## P5: Assessor Vem Primeiro

**Toda feature, toda métrica, toda decisão prioriza assessor.**

Se é bom para assessor mas ruim para outro público, fazemos mesmo assim.

Se é ruim para assessor mas bom para scale, não fazemos (ainda).

---

## P6: Dívida Técnica é Dívida de Produto

**Refatoração não é "overhead" — é evolução.**

Se código fica complexo, produto fica lento depois.

Arquitetura hexagonal, testes, documentação não são nice-to-have — são trilho.

---

## P7: Single-Player Value > Network Effects

**Fase 1 não depende de densa rede.**

Assessor ganha valor **antes** de toda rede estar online.

(Network effects são Fase 2+.)

Todo feature deve ter valor no dia 1, sozinho.

---

## Como Usar Principles

### Exemplo 1: Feature Request — "Scores de Reputação"

**Pedido**: "Vamos mostrar um número 0-10 de confiança, mais simples."

**Decisão**: Recusa.

**Princípio**: P1 (Verificabilidade) + P4 (Fatos).

"Scores são interpretação, não fato. Violam P1 e P4."

### Exemplo 2: Design — "UI Muito Densa"

**Pedido**: "Cards muito grandes, espaço perdido. Vamos compactar."

**Decisão**: Mantém espaço.

**Princípio**: P2 (Contexto).

"Contexto precisa de espaço para respirar. Compactar = perder contexto."

### Exemplo 3: Engenharia — "Skipar Testes"

**Pedido**: "Deadline apertado, vamos skipar testes agora, refaz depois."

**Decisão**: Recusa.

**Princípio**: P6 (Dívida Técnica).

"Dívida técnica é dívida de produto. Adia problema, não resolve."

---

## Quando Princípios Conflitam

Raro, mas acontece. Nessa ordem de prioridade:

1. **P5 (Assessor Primeiro)** — sempre vence
2. **P1 (Verificabilidade)** — nunca abrimos mão
3. **P2, P3, P4, P6, P7** — negocia caso a caso

---

_Última revisão: junho/2026 | Contribuidores: Gabriel Quental_
