# Spec (avaliação) — Paradigma de Produto/UX do FeelWorks

> Status: **avaliação estratégica de material recebido**, não spec fechada. Cruza um texto
> de direção de produto/UX para o FeelWorks (5 prompts de tela + o conceito "Today" + o
> paradigma de "estados mentais") e dois mockups gerados por IA a partir desses prompts
> contra o que já está travado na Creative Constitution da Feel (`docs/specs/07-feel-
> holding-crossref.md`) e no CLAUDE.md deste repo. Objetivo: dizer com precisão o que é
> confirmação do que já existe, o que é elevação genuína, e o que é colisão com lei
> travada — para o fundador decidir com informação, não por acúmulo silencioso de mockup.

---

## 1. O que o material é

Um texto de direção criativa (5 prompts no estilo "brief de estúdio" para Home, Workspace,
AI Studio, Analytics, Settings) + um sexto conceito ("Today", a tela-assinatura proposta) +
uma segunda camada de raciocínio estratégico (paradigma de "estados mentais": Orientação →
Exploração → Trabalho → Inteligência; o componente "Feel Flow Bar"; atmosferas de fundo;
"Information Breathing"). Os dois mockups anexos são gerados a partir desses prompts — um
deles é literalmente o slide-fonte ("5 PROMPTS PARA DESENVOLVER A UI DA FEEL").

Isto não é um estudo isolado: é a mesma linha de raciocínio da spec 06
(`06-identidade-visual-pesquisa.md`) e da reflexão de UX cruzada nesta sessão para o Claim
Profile (Hick's Law, Recognition over Recall, Progressive Disclosure) — agora aplicada à
superfície principal do FeelWorks, não a uma tela isolada.

## 2. Influencia o trabalho? Sim — mas em três categorias distintas

### 2.1 Confirma o que já está travado (não é novidade, é validação)
Vale nomear porque reduz risco: quem escreveu isto já fala a língua da Constitution, sem
copiá-la palavra por palavra.

- **Motion.** "Quando um card aparece, ele desliza, não voa. Quando uma janela abre, ela
  emerge, não explode." É quase tradução literal da lei de motion da Feel: "desenhar ·
  revelar · conectar · respirar · deslizar · entrelaçar... proibidos: explodir, quicar,
  girar sem motivo, piscar."
- **Evidência sobre afirmação.** "Cards que contam histórias, não números crus" ("12 novas
  oportunidades, +4 vs. semana passada, as maiores vieram do Instagram" em vez de "127
  Leads") é a mesma regra do DESIGN.md: "sempre o fato, nunca o slogan" — e da spec 06,
  princípio 1 ("evidência sobre afirmação... reforça D1, proibido score").
- **Sem dashboard de métrica crua na Home; gráfico só quando responde pergunta.** Já é a
  régua da spec 06 ("sente GitHub/ferramenta, ou sente vitrine?") e do "O Teste" da Feel.
- **Navegação que muda por contexto, não por página fixa (Feel Flow Bar).** É a aplicação
  direta da Lei 3 da Constitution ("nada acontece isolado") e do pedido já registrado na
  spec 06 ("a navegação muda conforme o contexto e o que você está fazendo").

Conclusão: nesta parte, não há decisão nova a tomar — é sinal de que a pessoa que escreveu
está calibrada com o sistema, e dá para elevar direto sem ADR.

### 2.2 É genuinamente novo e de alto valor — vale promover a princípio
- **"Estados mentais" em vez de "telas".** Orientação (contexto, zero gráfico) →
  Exploração (mesa, poucos elementos, escolha) → Trabalho (listas/tabelas/kanban, só
  quando há intenção) → Inteligência (copiloto contextual, nunca chatbot). Isto não
  contradiz nada — é uma **arquitetura de informação nova** que a Constitution não tinha
  (ela trava tom e superfície, não sequência cognitiva). É compatível com Progressive
  Disclosure e com o próprio "revela, não grita": cada estado revela só o que o momento
  pede.
- **A tela "Today".** Como conceito de tela-assinatura ("o que mudou desde a última vez,
  o que precisa da sua atenção, o que a IA já resolveu, o que você pode delegar, qual a
  próxima ação") é a aplicação mais forte de Lei 1 ("tudo está em transformação, nunca
  existe estado final") que já apareceu em qualquer material da Feel até agora — mais
  forte que os próprios exemplos da Constitution. É candidata real a diferencial, não é
  modismo de dashboard de IA.
- **"A Feel não deve vender produtividade, deve vender clareza."** Isto é posicionamento,
  não só UI — vale cruzar com o `feel-constituicao-v3.md` (que já fala em "camada
  estruturada de identidade profissional... a camada que faltava") e citar como possível
  refinamento de promessa de marca, não só de tela.

Recomendação: promover os dois primeiros (estados mentais, Today) a princípios nomeados do
sistema de produto — eles não brigam com nenhuma lei travada, só preenchem uma lacuna que
a Constitution (documento de MARCA) não tinha como cobrir (arquitetura de PRODUTO).

### 2.3 Colide com lei travada — exige decisão explícita, não herança por mockup bonito

Aqui está o motivo real de eu escrever este documento em vez de só responder "gostei". Um
mockup convincente é exatamente como decisão trancada é reaberta por acidente — o próprio
padrão que o fundador já nomeou como risco nº1 do projeto.

**(a) Glass — a colisão mais séria.** A Constitution é explícita e restritiva: glass é
"2% da dosagem", "comportamento, não linguagem", aparece **só** sobre conteúdo em estado de
descoberta (prova aguardando 2ª assinatura, oportunidade em preview, perfil incompleto),
"máximo 20% da composição", e "quando o conteúdo é revelado, o vidro sai — é um estado, não
um estilo". O texto recebido propõe o oposto em quase todas as telas: "Glass only in
navigation" (Home), "Glass navigation" (Workspace), uma tela inteira de "Elegant Liquid
Glass... Dynamic Island quality" (AI Studio), e em Settings um **slider permanente de
"Glass Material Intensity"** controlado pelo usuário. Os mockups confirmam: o ⌘K é um
painel glass permanente, e o painel "Aparência" tem "Intensidade do desfoque" como
preferência ambiente, não como estado de conteúdo não-revelado. **Isso não é refinar a regra — é
substituí-la.** Vira ornamento permanente, exatamente o que a Constitution nomeia como
falha ("glass sai da identidade e entra no comportamento... por isso ganha significado, em
vez de virar decoração"). Decisão do fundador, não miha: manter glass como estado de
descoberta (2%, restrito) e tratar esses mockups como estudo de material a podar; ou
assumir conscientemente que o produto FeelWorks quer glass ambiente e **escrever isso como
emenda à Constitution** — não deixar as duas versões coexistindo sem lei.

**(b) Modes — claro/escuro deixa de ser contexto e vira preferência.** A Constitution
trava: "Claro é o sistema. Escuro é o palco" — light é o produto/documento/institucional;
dark é reservado a evento/keynote/FeelMakers. O texto recebido propõe 5 "atmosferas"
(Studio/Paper/Aurora/Nature/Night) escolhidas livremente pelo usuário nas configurações,
com Night como uma delas — ou seja, dark vira gosto pessoal do usuário do produto, não
sinal de contexto de palco. A ideia de atmosfera em si é boa e não precisa ser descartada
— mas a regra "escuro só no palco" precisa ser reescrita ou explicitamente suspensa para o
produto FeelWorks, não silenciosamente contornada porque o mockup ficou bonito à noite.

**(c) Tipografia "thin/elegante".** Os 5 prompts repetem "thin elegant typography" /
"beautiful typography hierarchy". O DESIGN.md trava Archivo com pesos 400/500/600/700 —
não existe peso "thin" (300) especificado nem testado contra a regra "hierarquia por peso,
escala e espaço". Risco pequeno mas real: "thin" é o adjetivo-padrão que geradores de UI
por IA aplicam a qualquer marca "premium", independente do sistema por trás. Vale checar
contraste e legibilidade do Archivo em peso baixo antes de aceitar como direção, não aceitar
porque "parece elegante" no mockup.

**(d) Multi-agente — já era quarentena; agora é o protagonista visual.** O crossref
(spec 07, seção 2.2) já registrou que os mockups anteriores mostravam Content/Growth/CRM/
Finance Agent e que o fundador optou por atravessar a quarentena do CLAUDE.md
conscientemente. Este novo texto não muda essa decisão — mas eleva a aposta: 3 dos 5
prompts (Workspace, AI Studio, e o "Today") colocam agentes com "humor, estado, atividade,
última ação, próximo passo" como o **centro visual** do produto, não como um card lateral.
Isso não é uma nova decisão a tomar — é um lembrete de que a decisão já tomada agora carrega
mais peso de execução do que parecia quando foi tomada.

**(e) Repertório de referência amplia para o lado consumer-gloss.** O repertório travado
na `feel-constituicao-v3.md` é GitHub (prova/estrutura) + LinkedIn (modelo de rede, nunca
estética) + Airbnb/iFood (confiança) + Behance (o que evitar). Os 5 prompts trazem Apple,
VisionOS, Arc Browser, Instagram premium, Nothing OS. Alguns encaixam bem (Arc Browser é
citado nos dois lados — "simplicidade"; Linear, citado no texto de abertura, é quase um
primo direto do "GitHub com alma" que a Constitution já busca). Mas VisionOS/Instagram-
premium/Nothing-OS empurram para um polish consumer que tensiona com a advertência mais
dura da Feel: "se parece anúncio de SaaS, está errado" e "nunca mockup brilhante de
dashboard". Não é para descartar as referências — é para aplicar o Teste em cada peça que
sair delas, não confiar no nome da marca citada.

## 3. Recomendação

**Elevar direto, sem ADR** (seção 2.1 e 2.2): motion já confirmado, cards-com-fato, Feel
Flow Bar, estados mentais (Orientação/Exploração/Trabalho/Inteligência), o conceito Today
como tela-assinatura candidata. Nenhum desses contradiz lei travada.

**Decisão explícita do fundador antes de qualquer peça final** (seção 2.3): duas novas ADRs
somam-se às três já abertas no cross-reference (cor, assinatura de marca, score):
- **ADR-glass:** manter glass como 2%/estado-de-descoberta (poda os mockups) OU emendar a
  Constitution para permitir glass ambiente no produto FeelWorks.
- **ADR-modes:** manter "escuro só palco" OU emendar para "escuro é atmosfera opcional do
  produto", com FeelMakers permanecendo a única obrigação de dark mode.

Diferente das três ADRs anteriores (cor/assinatura/score, onde a recomendação já é clara o
bastante para travar), estas duas mexem em leis físicas do sistema (a dosagem 90/8/2 e os
Modes) — não recomendo travar por conta própria sem o fundador ver as duas versões lado a
lado. Ficam registradas como **abertas**, não travadas.

## 4. Onde isto se conecta

- Cross-reference geral Feel × FeelWorks: `docs/specs/07-feel-holding-crossref.md`.
- Reflexão de UX cognitiva aplicada ao Claim Profile (Hick's Law, Recognition over Recall,
  Progressive Disclosure) discutida nesta mesma sessão — os "estados mentais" deste
  documento são a versão de produto inteiro do mesmo raciocínio aplicado antes a uma tela.
- Spec 06 (`06-identidade-visual-pesquisa.md`) — já pedia exatamente "navegação que muda
  conforme o contexto" e "GitHub, não Behance"; este texto é a resposta detalhada a esse
  pedido, não um desvio dele.
