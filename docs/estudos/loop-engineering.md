# Loop engineering — estudo e aplicação à Massa Hub

> Data: 2026-06-21. Autor: sessão Claude Code, a pedido do Gabriel.
>
> **Este documento é material de referência conceitual. Não autoriza, por si só,
> construir nenhum sistema multi-agente de produto.** Ver `docs/decisoes/log.md` —
> seção "Reabertura consciente de D10" — para o status vigente de D10.

---

## 1. O que é loop engineering

Loop engineering é o design do *processo* que produz ou refina uma saída de IA contra
um critério de avaliação ou feedback — em oposição a uma chamada única, "open-loop",
onde o prompt sai, a resposta volta, e ninguém mais olha pra ela de forma estruturada.

Diferença prática de "prompt engineering": prompt engineering é escrever um prompt bom.
Loop engineering é sobre o que acontece *depois* — quem (ou o quê) avalia a saída, com
que critério, e o que muda no sistema como consequência. Um prompt ótimo escrito uma vez
e nunca mais revisitado não é loop engineering, é só um bom prompt.

## 2. Taxonomia de loops

**Workflows vs. Agents** (Anthropic, "Building Effective Agents"). Workflows são
sistemas onde LLMs e ferramentas são orquestrados por um caminho de código predefinido —
previsível, testável. Agents são sistemas onde o LLM dirige dinamicamente seu próprio
processo e uso de ferramentas — flexível, mas mais difícil de prever e testar. A escolha
entre os dois não é ideológica, é sobre o quanto a tarefa tolera imprevisibilidade.

**Padrões de workflow:**
- *Prompt chaining* — decompõe a tarefa em passos sequenciais, cada chamada processa a
  saída da anterior. Troca latência por precisão.
- *Orchestrator-workers* — uma LLM central decompõe a tarefa e delega a workers
  especializados, depois sintetiza o resultado. Bom para subtarefas imprevisíveis (ex.:
  mudanças em múltiplos arquivos de código).
- *Evaluator-optimizer* — uma LLM gera, outra (ou um humano) avalia e dá feedback
  iterativo. **Funciona quando há critério de avaliação claro e o refinamento iterativo
  tem valor mensurável.** Não funciona sem essa bússola — um loop sem critério de
  avaliação não converge, só gira.

**Self-prompting / meta-prompting** — variante do evaluator-optimizer onde o próprio
optimizer também é uma LLM (o agente lê seu próprio resultado e reescreve seu próprio
prompt). Risco real: sem um dataset de avaliação ancorado em julgamento humano, o loop
otimiza para o critério que o avaliador-LLM acha bonito, não para o que importa de fato
(efeito Goodhart — "quando uma métrica se torna o alvo, ela deixa de ser uma boa
métrica").

**DSPy e otimização automática de prompt** — formaliza o evaluator-optimizer como
compilação de programa. Fluxo: definir uma *Signature* (entrada/saída tipada) → compor em
*Modules* (Predict, ChainOfThought, ReAct) → rodar um *Optimizer* (MIPROv2, GEPA,
BootstrapFewShot, COPRO) contra uma métrica + exemplos rotulados → o otimizador ajusta
instruções e demonstrações automaticamente até convergir, e o resultado compilado é um
artefato de produção. Exige volume de exemplos rotulados — é fácil de overfitar em ruído
com poucos casos.

**Autonomous agent loop** — plan → execute → observe feedback do ambiente → repete,
pausando em checkpoints para julgamento humano. É a categoria mais distante da realidade
atual da Massa Hub: pressupõe ambiente rico de ferramentas, tarefas longas, tolerância a
custo de tokens — nenhuma dessas pré-condições existe ainda no produto.

## 3. Loop como técnica de build vs. loop como arquitetura de produto

Esta distinção é o que evita confundir o que já é prática normal com o que está em
quarentena.

**Build-time** — como o Gabriel e o Claude Code trabalham juntos para *construir* o
produto. Já existe precedente documentado: fan-out paralelo de subagentes Claude Code
para construir adapters em paralelo (`docs/sessoes/2026-06-18_sessao-5.md`). Aqui o
"produto" sendo otimizado é o processo de desenvolvimento, não o runtime do Massa Hub.
Isso é orchestrator-workers aplicado à própria construção — já permitido, já em uso.

**Run-time de produto** — o que o usuário final da Massa Hub experimenta quando publica
um ticket. Hoje é **um agente, uma chamada** (D10): `ExtratorDeTicketAnthropic`. Qualquer
loop aqui — evaluator-optimizer rodando em produção, múltiplos agentes conversando para
montar um ticket — é multi-agente de produto e está em quarentena.

A confusão entre esses dois eixos é exatamente o gatilho do anti-padrão #1: "ah, mas eu
já uso multi-agente pra construir, então por que não no produto" é um non-sequitur. Build
e runtime têm tolerâncias de risco e custo completamente diferentes — um subagente de
build que erra custa minutos de retrabalho; um agente de produto que erra publica um
ticket errado pra uma marca real.

## 4. Claude Code: skills e subagents como infra de loop

**Skills** — arquivo `SKILL.md` com frontmatter (description, allowed-tools,
disable-model-invocation) + corpo markdown. *Progressive disclosure*: o corpo só carrega
no contexto quando a skill é de fato usada — diferente do CLAUDE.md, que carrega sempre.
Dois tipos de conteúdo: *reference* (convenções/conhecimento, roda inline) e *task*
(passo-a-passo de ação, geralmente invocado direto via `/nome`). *Dynamic context
injection* — uma linha como `` !`git diff HEAD` `` roda o comando e injeta o output antes
do Claude ler a skill. Localização: pessoal (`~/.claude/skills/`), projeto
(`.claude/skills/`), plugin.

**Subagents** — contexto isolado, system prompt customizado, tools restritas, retornam
só um resumo pro contexto principal. Usar quando uma tarefa lateral inundaria o contexto
principal com material que não será referenciado de novo (exploração de código, logs,
pesquisa).

**Aplicação direta**: as duas skills de workflow desta entrega (`/freio-de-escopo`,
`/fim-de-sessao`, seção 6) são loop engineering aplicado ao processo do Gabriel com o
Claude Code, não ao produto.

Nota sobre `/loop` (nativo do Claude Code, roda um prompt em intervalo recorrente): não
há hoje nenhum processo do Massa Hub que precise rodar em intervalo — não há fila, não há
monitoramento contínuo na Fase 1. Mencionado por completude, sem uso identificado agora.

## 5. O que é aplicável agora vs. quarentena/fase 2+

| Técnica | Status agora | Onde aplicar | Por quê |
|---|---|---|---|
| Evaluator-optimizer com humano como optimizer | **Permitido** | `eval/ticket/` sobre o adapter de extração existente | Não é agente novo — é qualidade de engenharia de um adapter que já existe. D10 proíbe orquestrar múltiplos agentes, não avaliar um. |
| DSPy / otimização automática de prompt | Quarentena por falta de pré-condição, não por D10 | — | Exige volume de exemplos rotulados que não existe ainda (~0 briefings reais processados em produção). Infra prematura — o "otimizador" certo agora é o Gabriel lendo divergências. |
| Self-prompting / meta-prompting de produto | Quarentena (D10 + anti-padrão #1) | — | É multi-agente com roupa de "auto-melhoria". |
| Skills/subagents para o workflow do Gabriel com o Claude Code | **Permitido, incentivado** | `.claude/skills/` | Build-time, não runtime de produto. |
| Orchestrator-workers de produto (pipeline extrair→validar→match→notificar com agentes autônomos) | Quarentena agora; candidato a *pipeline determinístico* na fase 2+ | — | D10 já endossa "pipeline" como arquitetura mental para fase 2+ — mas testável, não enxame. |

(Tabela cruza de volta com CLAUDE.md §5-7 e `docs/decisoes/log.md`.)

## 6. Adaptado à sua realidade

Você é fundador solo, estrategicamente forte e deliberadamente não-técnico, bootstrapado,
com o Claude Code como sua equipe de execução. O ROI real de "loop" pra você **não é
construir um sistema de agentes** — é fechar o loop entre o que você pede ao Claude Code
e o que fica registrado, lembrado e auditável entre sessões que são, por natureza,
efêmeras.

Esse loop já existe parcialmente: `session-start.sh` + `session-end.sh` +
`docs/sessoes/`. A lacuna real não é falta de inteligência artificial — é falta de hábito
e automação no início e no fim de cada sessão. `PROMPTS.md` hoje depende de você lembrar
de colar o prompt certo na hora certa; é um loop manual, frágil ao esquecimento.

Reformulando "loop engineering" nos seus termos: **loop = (você pede → o Claude Code
executa ou recusa citando a regra → a decisão/sessão fica registrada → a próxima sessão
já começa sabendo disso)**. As duas skills desta entrega (seção 6 abaixo, item de
implementação) são a materialização direta dessa reformulação — não pesquisa de IA, só
hábito automatizado.

O verdadeiro "evaluator" da Fase 1 não é uma segunda IA — é você mesmo revisando o ticket
extraído antes de publicar. É exatamente o desenho da Screen 10: a IA propõe, o humano
confirma. Loop engineering aqui significa instrumentar esse loop humano: capturar os
casos em que você edita o que a IA propôs e transformar isso em caso de avaliação
(`eval/ticket/fixtures/`). Isso é o que o esqueleto de eval desta entrega prepara.

**Mensagem central**: você não precisa de mais arquitetura de IA agora. Precisa de mais
disciplina de captura de dado (briefings reais → casos de eval) para que, quando o volume
justificar investir em DSPy ou em mais de um agente, a decisão seja baseada em evidência
acumulada — não em ficar fascinado pelo framework do mês.

## 7. Avaliação honesta de multi-agente como direção de produto futura

Você pediu para reabrir essa discussão conscientemente — então vamos tratá-la a sério,
sem hype e sem suavizar.

Critérios objetivos de quando reavaliar D10 (não "quando parecer legal", critérios que dá
pra checar):

1. **Critério de volume**: X oportunidades/mês sendo processadas pelo agente único atual,
   de forma que o gargalo visível passe a ser precisão/cobertura de extração — não
   throughput de cadastro. Hoje (~19 perfis, módulo em construção) esse gargalo nem
   existe.
2. **Critério de funcionalidade**: presença de funcionalidades de produto que de fato dão
   o que orquestrar — matching de candidatos por Lastro, verificação cruzada de papéis,
   negociação entre partes. Nenhuma delas existe hoje como feature. Multi-agente sem
   essas funcionalidades não tem o que coordenar — seria arquitetura à procura de
   problema.
3. **Critério de dado**: um dataset de eval (`eval/ticket/`) com volume real (dezenas a
   centenas de casos, não 2) mostrando que um agente, uma chamada está no platô de
   qualidade. Só aí "adicionar uma segunda cabeça" (um verificador, um orchestrator) tem
   ROI mensurável em vez de ser estética de arquitetura.

Nomeando a sereia sem rodeio: conteúdo de mercado tipo "o futuro são times de IA" é
estímulo de engajamento, não dado de produto da Massa Hub. Histórico do projeto já mostra
o custo desse padrão — Identity OS virou "infraestrutura existencial" antes de ter uma
linha de produto validada.

**Esta seção é avaliação, não roadmap.** Não cria nenhuma obrigação de construir nada. A
decisão de quando agir continua sendo D10 até ser formalmente substituída — e substituir
D10 exige checar os três critérios acima com dado real, não com vontade.

## 8. Achados dos vídeos assistidos (2026-06-21)

Você pediu para eu assistir 6 vídeos sobre loop engineering e procurar saca escondida,
não só repetir o que já está nas seções 1-7. Assisti 5 (Austin Marchese, Greg
Isenberg/Ross Mike, um terceiro sobre harness/sinais, How I AI, e um quinto sobre o
viral de Boris/Peter; o sexto bloqueou por detecção de bot do YouTube mesmo após
retentativas). Três achados realmente mudam alguma coisa no raciocínio, o resto é
reforço do que já está escrito acima:

**1. Os dois nomes que estão "vendendo" loop (Boris Cherny da Anthropic, Peter
Steinberger da OpenAI) têm orçamento de token estruturalmente diferente do seu.** Não é
hipérbole: Peter Steinberger publicamente queimou **US$ 1,3 milhão em tokens em um único
mês**, e ambos têm acesso interno irrestrito a modelo, segundo o próprio conteúdo. O
crítico convidado no podcast do Greg Isenberg (Ross Mike) faz o ponto que falta na maior
parte do hype: "se eu tivesse orçamento de token ilimitado, eu também estaria fazendo
isso." Isso não é "tokens custam caro, cuidado" genérico — é que o conselho está vindo de
gente cuja função de custo não existe para você. Reforça objetivamente o critério 1 da
seção 7 (volume) e o tom geral da seção 6: o gargalo aqui nunca foi falta de arquitetura
de IA, é orçamento real de fundador solo bootstrapado.

**2. O loop mais concreto e funcional entre todos os exemplos mostrados é exatamente do
formato que `eval/ticket/` já antecipa — e ele quebra de um jeito específico que vale
documentar.** O exemplo do Ross Mike é um loop de code review (Cursor + Greptile):
critério binário (nota 0-5), o agente itera até nota ≥ 4/5 ou 5 tentativas. Funciona
porque o resultado é binário/quantificável — ele mesmo nomeia isso: "loops fazem sentido
onde a saída é binária; quebram onde precisa de criatividade." Isso é exatamente o
argumento de D1 (Lastro é fato contável, nunca nota) só que do lado da engenharia: nota
funciona pra avaliar um adapter de software, nunca pra avaliar reputação de pessoa — os
dois namespaces continuam certos por exigirem o mesmo tipo de saída (binária/contável), e
o próprio eval do ticket é esse caso de uso, não um precedente para pontuar Lastro. Saca
adicional não óbvia: mesmo nesse loop bem desenhado, ele relata que **quebra acima de
~1000 linhas de código revisadas de uma vez** — ou seja, mesmo um loop funcional precisa
de um teto explícito de tamanho/complexidade da unidade de trabalho, não só
trigger+meta+verificação. Se algum dia o eval de ticket evoluir para rodar em lote, vale
manter os fixtures pequenos e específicos por essa mesma razão.

**3. O vídeo sobre harness (canal de produto, não citado pelo nome) descreve uma camada de
memória compartilhada em markdown — "signals", "artifacts", "contract" por domínio, e um
log de trabalho global — que é praticamente um espelho do que você já tem parcialmente
montado, com uma peça faltando.** `docs/decisoes/log.md` já é o "contract" (timeline de
decisões), `docs/sessoes/` já é o "work log" global. A peça que falta é o "signals": um
lugar de fricção mínima para registrar uma observação/ideia/incômodo percebido durante uma
sessão *antes* dele virar decisão formal ou spec — hoje isso só existe na sua memória ou
se perde. A frase do vídeo que resume por que isso importa mesmo sem nenhum agente
autônomo: "o agente esquece, o repositório não" (citando Addy Osmani) — e no seu caso
isso é literal, não metáfora: sessões remotas rodam em containers efêmeros: se não foi
commitado, não existe na próxima sessão. **Isto é uma recomendação, não uma implementação
desta entrega** (mesma régua da seção 4): um `docs/sinais.md` simples — uma lista
append-only de observações datadas, sem estrutura de pastas por domínio (você tem um
produto, não times) — seria a versão mínima e de baixo custo dessa ideia, só se você
achar que vale a fricção de mantê-lo. Não criei o arquivo; é uma sugestão pendente de ok
seu, igual a `/inicio-de-sessao`.

Resto do conteúdo dos vídeos (taxonomia de trigger: heartbeat/cron/hook/goal; loop vs.
automação — automação executa passos fixos, loop decide se atingiu a meta; "harness" como
tudo que não é o modelo; sub-agentes nunca verificando o próprio trabalho) já está coberto
pelas seções 2-4 acima ou é geral demais para mudar alguma decisão da Massa Hub.

## Implementado nesta entrega (referência rápida)

- `docs/decisoes/log.md` — subseção "Reabertura consciente de D10 (2026-06-21)".
- `.claude/skills/freio-de-escopo/SKILL.md` — auto-invocável quando um pedido cheira a
  expansão de tese; também `/freio-de-escopo` manual.
- `.claude/skills/fim-de-sessao/SKILL.md` — preenche o conteúdo do resumo de sessão que o
  hook `session-end.sh` apenas estrutura como casca.
- `eval/ticket/` — esqueleto de evaluator-optimizer humano sobre o adapter de extração
  existente, conforme já especificado em `AGENTS.md`.

Recomendação para rodada futura, não construída agora (não inflar o escopo desta
própria entrega): skill `/inicio-de-sessao` automatizando o PROMPT 1 de `PROMPTS.md`
(ler CLAUDE.md + specs + decisões e resumir o trilho atual).
