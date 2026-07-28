# Spec (cross-reference) — Feel (holding) × Massa Hub / FeelWorks

> Status: **documento de mapeamento estratégico**, não uma spec de produto. Não altera
> nenhuma decisão travada da Fase 1 (specs 01–06) por si só. Registra onde a marca-mãe
> **Feel** e o produto que este repo constrói **já coincidem**, onde **colidem** e o que
> disso exige decisão explícita do fundador — não herança silenciosa.
>
> Origem: o fundador subiu nesta sessão o sistema de marca completo da Feel (Creative
> Constitution, `DESIGN.md`, gramática do fio), a apresentação institucional da FeelSpace
> e dois mockups de UI da FeelWorks. Definição do fundador, coletada ao vivo: **Feel é a
> holding; FeelMakers é o espaço físico (shoppings); FeelWorks é a rede — a evolução da
> Massa Hub.** Ou seja: este repo não é um produto paralelo à Feel. É o que a Feel chama,
> na sua própria hierarquia, de FeelWorks.

---

## 1. Onde já se encontram (sem precisar de tradução)

O mais importante deste documento não é o que colide — é que a marca Feel e a Massa Hub
já falam a mesma língua, criada em documentos diferentes e sem coordenação consciente
entre eles até agora. Isso é sinal forte de tese consistente, não coincidência a ignorar.

**Vocabulário idêntico.** A seção *Voice* do `DESIGN.md` da Feel trava o léxico:
> "Vocabulário de builder — lastro, prova, obra, ritmo, oportunidade, ticket, permuta,
> publi, assessor. A voz nunca explica; sugere. Nunca 'plataforma inovadora que conecta';
> sempre o fato: '34 provas assinadas'."

Isso é, palavra por palavra, o vocabulário que o CLAUDE.md da Massa Hub e a spec 01
(`01-reputacao-lastro.md`) já travam: Lastro, Prova, Ritmo, assessor, oportunidade. Os
dois lados chegaram ao mesmo dicionário por caminhos separados.

**Filosofia de reputação idêntica.** A lei-raiz da Feel — "a Feel revela, não cria" e "o
design revela, nunca grita" — é a mesma tese da seção 3 do CLAUDE.md da Massa Hub:
"Reputação = Lastro, nunca score. Fatos, não notas." Ambos os documentos proíbem
explicitamente o mesmo antídoto (score numérico, badge de nota, "Trust Index"). A regra
do "O Teste" da Feel ("sem cor, sem logo, ainda comunica clareza?") e a régua de qualidade
da spec 06 ("sente GitHub/ferramenta, ou sente vitrine?") apontam para o mesmo alvo:
evidência sobre afirmação.

**O assessor como porta de entrada.** Já é decisão travada dos dois lados — CLAUDE.md
seção 3 ("assessor é o cavalo de Troia") e spec 03 ("o assessor é o super-nó que traz os
creators") — sem que a Feel precisasse dizer isso explicitamente no material de marca.

**Registro fotográfico e de motion.** "Documental, em relação, nunca performática" (Feel)
e "o trabalho é o herói, não o rosto" (spec 06, princípio 2) descrevem a mesma escolha
com palavras diferentes. "A marca se desenha... movimento que revela, nunca decora"
(Feel) e "movimento que prova, não que enfeita" (spec 06, princípio 6) são a mesma regra.

**Conclusão da seção 1:** não existe conflito de tese entre Feel e Massa Hub/FeelWorks.
O que existe é um vocabulário de marca (Feel) que ainda não tinha visto o produto que
já pratica esses princípios havia meses. A convergência é genuína, não forçada.

---

## 2. Onde colidem — decisão do fundador, não omissão

### 2.1 Cor institucional: violeta vs. coral

- Massa Hub (CLAUDE.md seção 9, spec 04): violeta `#6C5BFF` como cor de marca.
- Feel (`DESIGN.md`): coral `#FF5C3D`, dosagem 90/8/2, **regra do anel — um elemento
  coral por composição**, nunca preenchendo fundo ou texto longo.
- A spec 06 já tem uma frente aberta e não fechada sobre isso: o estudo de direção
  criativa propôs testar **âmbar** (`#FF5A2D`) contra o violeta para o heatmap de Ritmo,
  e decidiu **não cravar antes da Screen 10 real** — "cravar cor antes da primeira tela
  real é o Anti-Padrão #1 vestido de rigor de marca".
- Isto vira agora uma discussão de **três**, não duas: violeta (Massa Hub atual), âmbar
  (proposta em prova da spec 06) e coral (Feel holding). Coral e âmbar, aliás, já são
  vizinhos de família na paleta da própria Feel — e a Feel proíbe os dois convivendo na
  mesma peça ("amber é exclusivo do FeelMakers; nunca com coral").
- **Recomendação:** não resolver aqui. A spec 06 já criou o mecanismo certo — provar na
  Screen 10 com dado real antes de travar token. Adicionar coral como terceiro candidato
  ao mesmo experimento, não decidir por herança automática da holding.
- **Pergunta que só o fundador responde:** FeelWorks herda o coral da Feel (rede vira
  visualmente parte da holding) ou mantém violeta como acento de sub-marca dentro dos
  neutros da Feel (paper/tint/bone/steel/ink)? Isto é decisão de arquitetura de marca —
  não deveria ser respondida por omissão na primeira tela que usar as duas paletas juntas.

### 2.2 Um agente vs. múltiplos agentes

- CLAUDE.md seção 5 (quarentena) e seção 8: "IA na Fase 1 = um agente, uma chamada...
  NÃO é sistema multi-agente. Multi-agente resolve escala que não temos com ~19 perfis."
- Os dois mockups de UI da FeelWorks mostram uma arquitetura de **Content Agent, Growth
  Agent, CRM Agent, Finance Agent e Design Agent** rodando em paralelo, cada um com
  estado próprio ("Planejando", "Analisando", "Monitorando", "Criando") — exatamente o
  desenho que a quarentena descreve como "Identity OS com roupa nova".
- Nesta sessão, perguntado diretamente se isso é reorientação consciente ou desvio, o
  fundador respondeu: **"Preciso passar por cima dos anti-padrões, e conseguir
  implementar as funcionalidades do roadmap de maneira estratégica mas sem bloqueios
  restritos."** Isso cumpre o protocolo da seção 6 do CLAUDE.md (nomear → citar regra →
  perguntar) — a resposta fica registrada aqui como a reorientação assumida.
- **O que isso muda, na prática, a partir de agora:** multi-agente deixa de ser "erro a
  apontar toda sessão" e vira **item de roadmap com gatilho a definir**, não coisa a
  construir dentro da Fase 1 atual (Camada 3 do claim profile segue single-agent, sem
  mudança). O gatilho — densidade de rede, receita de assessor, ou simplesmente "quando
  FeelWorks for anunciado" — ainda não está definido. Fica como decisão pendente, não
  como suposição minha.
- **Risco a nomear, não resolver por conta própria:** multi-agente aumenta ordens de
  grandeza a superfície de manutenção de um fundador solo (CLAUDE.md seção 8:
  "arquitetura hexagonal... para um fundador solo executar e manter"). A reorientação foi
  assumida — mas o "como" (pipeline determinístico orquestrado vs. agentes autônomos de
  fato) ainda cruza a distinção que a seção 5 já fazia: "pipeline determinístico testável
  > enxame autônomo", mesmo reavaliando a régua na Fase 2+.

### 2.3 Escopo da holding: Patteo

- O zip da identidade Feel inclui um "Estudo de Ocupação Patteo" e plantas baixas —
  aparentemente um projeto imobiliário, sem nenhuma ligação visível com a tese de
  economia criativa que ancora tanto a Feel quanto a Massa Hub/FeelWorks.
- Isto não foi perguntado ao fundador nesta sessão porque surgiu apenas na listagem de
  arquivos do zip, não no pedido original. Nomeio aqui, sem assumir resposta: se Patteo
  faz parte da tese da holding Feel, ou se é uma expansão de tese ainda não avaliada —
  o mesmo anti-padrão #1 que o CLAUDE.md pede para vigiar, agora em escala de holding e
  não só de produto.

---

## 3. Recomendação de sequenciamento

**Continua exatamente igual agora:** Camada 3 do Claim Profile (adapter Supabase +
Screen 10 + reivindicar), Fase 1 inteira. Nome, cor, arquitetura de agente — nada disso
muda até o fundador fechar as decisões da seção 2.

**Muda de pele depois, sem mudar de esqueleto:** quando FeelWorks for anunciado como o
nome público da rede, a camada visual (cor, wordmark, tom) pode migrar para o sistema
Feel sem exigir reescrever domínio/aplicação — a arquitetura hexagonal deste repo já
isola isso (CLAUDE.md seção 8). Rebrand de pele é troca de adapter/UI, não de núcleo.

**Exige decisão registrada (ADR) antes de qualquer linha de código:**
1. Cor institucional de FeelWorks (violeta / âmbar / coral) — resolver via experimento
   já previsto na spec 06, não por herança automática.
2. Gatilho de quando a arquitetura multi-agente é construída, e em que formato (pipeline
   orquestrado vs. agentes autônomos) — a reorientação foi assumida, o "quando" e "como"
   ainda não.
3. Se Patteo integra a tese da holding Feel ou é expansão a avaliar à parte.

---

## 4. Nota de leitura

A apresentação em PDF da FeelSpace (feita por Axel) não foi lida página a página nesta
sessão — são páginas rasterizadas sem camada de texto, e o ambiente não tinha
`poppler-utils` instalado para renderizá-las (instalar pacote é ação fora do escopo de
plan mode, em que este documento foi desenhado). Se o deck tiver decisões adicionais de
posicionamento que colidam ou reforcem o que está aqui, revisar numa sessão seguinte com
a skill `pdf` e emendar este documento — não é um documento fechado.
