# MentalModels — 6 Formas de Pensar na FeelWorks

## Propósito

Este documento ensina **como a FeelWorks pensa**.

Não é o que fazemos. É **como raciocinamos** sobre problemas.

Quando você absorver estes 6 modelos mentais, você **é** FeelWorks.

Audiência: Todos (especialmente Claude Code, novos membros, decisões estratégicas).

---

## Mental Model 1: Tudo Gira em Torno de Contexto

### O Modelo

Nenhuma decisão existe em vácuo.

**Contexto é o que torna informação significativa.**

### Como Funciona

Sem contexto:
- "Creator A com 50k seguidores" = genérico
- "Marca X precisa de creator" = vago
- "Taxa de aceitação 60%" = número solto

Com contexto:
- "Creator A tem 50k, especialista em tech, já trabalhou 3x com Nike, rejeitou Natura em fevereiro, cobrar 30k mínimo" = acionável
- "Marca X (skincare, NE, orçamento 25k, 5 creators, evento presencial) precisa de creator" = real
- "Taxa de aceitação 60% de creators de foto, 40% de lifestyle, 20% de NE — marca X é de SP então rejeição alta do NE" = insight

### Implicação no Design

- Cards grandes revelam contexto (não compactar)
- Sempre mostrar "por quê" (não só resultado)
- Workflow guiado por contexto (não formulário genérico)
- Dashboard filtrável (não agregado opaco)

### Implicação na IA

- IA não recomenda genericamente
- IA gera sugestões **contextualmente relevantes**
- IA injeta contexto em cada prompt

---

## Mental Model 2: Dados Existem Para Gerar Decisões

### O Modelo

**Dado que não leva a ação é desperdício.**

Coletamos porque sabemos que pergunta responderemos.

### Como Funciona

Pergunta: "Creator X aceitaria oportunidade Y?"

Dados necessários:
- Histórico de aceitações/rejeições de X
- Tipo de marca (se Y é similar a marcas aceitas antes)
- Valor (se Y paga o mínimo de X)
- Timing (se X está disponível agora)

Dados não coletamos:
- "Qual é o sentimento geral do creator sobre trabalhar?" (vago, sem ação)
- "Qual é a satisfação global?" (fácil virar score, proibido)

### Implicação

Cada métrica em FeelWorks responde a pergunta concreta.

Metadata sem pergunta = não medir.

### Implicação na Engenharia

- Logging estruturado (o que? por quê? contexto?)
- Analytics com "pergunta" definida
- Evitar tracking "just in case"

---

## Mental Model 3: IA Reduz Trabalho, Não Autonomia

### O Modelo

**IA é ferramenta da pessoa, não substituta.**

### Como Funciona

Ciclo de trabalho com IA:

1. **IA propõe** (estrutura, sugere, automatiza)
2. **Pessoa valida** (é correto? faz sentido?)
3. **Pessoa decide** (aprova, rejeita, refina)
4. **IA executa** (se aprovado)

Nuca: 1 → 4 (IA decidindo).

Sempre: 1 → 2 → 3 → 4.

### Implicação

Interface sempre mostra:
- O que IA propôs
- Por quê (raciocínio)
- Opção de rejeitar/refinar

Nunca:
- Ocultar que IA foi usada
- Automação sem confirmação (exceto se pessoa pediu)
- IA "aprimorando" dados sem feedback

---

## Mental Model 4: Toda Informação Precisa Produzir Ação

### O Modelo

**Informação sem ação é ansiedade operacional.**

### Como Funciona

Bad:
- Assessor vê 5 oportunidades waitando → não sabe por onde começar → stress
- Creator vê reputação baixa → não entende o que fazer → frustração
- Marca vê 50 candidatos → sem critério de filtro → paralisia

Good:
- Assessor vê 5 oportunidades → cada uma já ranqueada por fácil→difícil → começa pela fácil
- Creator vê reputação baixa → sabe que precisa de mais provas com marcas recorrentes → caminho claro
- Marca vê 50 candidatos → filtrados por contexto (região, budget, especialidade) → começa com top 3

### Implicação

Cada informação vem com **próximo passo**.

Sempre existe uma bussola (o que fazer agora?).

---

## Mental Model 5: Conhecimento Nunca Pertence a Uma Pessoa

### O Modelo

**Se conhecimento tá só na cabeça de alguém, é risco.**

### Como Funciona

Assersor A sabe: "Marca Natura adora creators do NE."

Se A sai, vai embora com a informação.

Em FeelWorks:
- Padrão capturado → fica no sistema
- Próxima Natura → sistema já sugere "NE first"
- Conhecimento é social, não pessoal

### Implicação

- Toda decisão importante é registrada (decision record)
- Toda lição é um playbook (reusável)
- Sistema aprende com cada interação
- Ninguém é insubstituível

### Implicação na Engenharia

- Observability (logging automático de padrões)
- Reprodutibilidade (código + docs, sempre)
- Knowledge base viva (atualiza com dados)

---

## Mental Model 6: Toda Interação Gera Memória

### O Modelo

**Sistema aprende continuamente sem extra trabalho do usuário.**

### Como Funciona

Assessor rejeita Creator X para Marca Y.

Sistema registra:
- "X rejeitou Y em DATA"
- "Por quê?" (se X explicou)
- "Próxima oportunidade Y: não sugerir X"

Outro assessor, mês depois, publica oportunidade Marca Y.

Sistema já sabe: "Probablidade X aceitar Y é baixa. Ranking diferente."

### Implicação

- Toda interação deixa rastro
- Rastro alimenta modelo mental do sistema
- Recomendações ficam melhores com tempo
- Privacidade é respeitada (só contexto relevante é guardado)

---

## Como Usar Mental Models

### Exemplo: Feature Request — "Adicionar Filtro de Mood"

**Pedido**: "Vamos perguntar ao creator qual é seu mood hoje (feliz/cansado/...) pra personalizar.?"

**Análise com Mental Models**:
1. **Contexto** (MM1): Mood não é contexto relevante para matching. Irrelevante.
2. **Dados → Decisão** (MM2): Que decisão "mood" mudaria? Nenhuma clara.
3. **IA auxilia** (MM3): IA pode detectar mood de tone de voz? Possível, mas não pede pessoa.
4. **Info → Ação** (MM4): Se sabe mood, que ação pessoa toma? Nenhuma óbvia.
5. **Conhecimento** (MM5): Mood de pessoa muda a cada dia, não é conhecimento.
6. **Memória** (MM6): Guardar 100 moods por pessoa = ruído.

**Decisão**: Recusa. Viola todos os 6 modelos.

---

## O Diferencial

Muitos times têm "filosofia" vaga ("user-centric", "data-driven").

Estes 6 modelos mentais são **concretos e acionáveis**.

Quando dúvida surge, volta aqui. Resolva com os modelos.

---

_Última revisão: junho/2026 | Contribuidores: Gabriel Quental_
