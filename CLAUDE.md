# CLAUDE.md — Massa Hub

> Este arquivo é a memória de longo prazo do projeto. O Claude Code lê isto em
> toda sessão. Antes de escrever qualquer código, leia este arquivo inteiro.
> Quando uma decisão aqui conflitar com um pedido pontual meu, **aponte o
> conflito antes de executar** — não me obedeça cegamente contra a constituição
> do projeto.

---

## 1. O que é a Massa Hub

Rede profissional vertical para a Creator Economy brasileira. O posicionamento é
"o LinkedIn da Creator Economy", mas com tom, cultura e estética do mercado
criativo — nunca corporativo.

Conecta os profissionais que **orbitam** o creator: assessores, agências,
profissionais criativos (foto, vídeo, design, jurídico, áudio) e os próprios
creators. A referência mental de produto é o **GitHub**, não o Behance: a
reputação emerge do trabalho visível e verificável, não de uma vitrine bonita.

Fundador solo (Gabriel Quental, Recife/PE), perfil estratégico não-técnico.
Construção 100% bootstrapada, com o Claude Code como equipe de execução.

## 2. O que a Massa Hub NÃO é

- ❌ NÃO é um diretório/vitrine de perfis bonitos (camada commodity, indefensável).
- ❌ NÃO é uma ferramenta de gestão para creator individual (tipo Tãmi).
- ❌ NÃO é um marketplace transacional de freelancer (tipo 99designs).
- ❌ NÃO é uma plataforma fechada de matching marca-creator (tipo Squid/BrandLovrs).
- ❌ NÃO é uma "rede de creators". O foco é quem orbita o creator — o assessor primeiro.

Se um pedido meu empurrar o produto para qualquer um desses, **me avise**.

## 3. Decisões de produto já tomadas (NÃO reabrir sem motivo forte)

### Reputação = Lastro, nunca score
- A unidade atômica de reputação é a **Prova**: um registro de trabalho real,
  **assinado pelos dois lados** (quem fez + quem contratou). É o equivalente ao
  commit co-autorado / repositório do GitHub.
- O **Lastro** é a soma de fatos contáveis e verificáveis: nº de provas, marcas
  distintas, marcas recorrentes, recomendações. **Fatos, não notas.**
- ❌ PROIBIDO: "Trust Index", "Capital Reputacional 7.4", qualquer score numérico
  de 0–100 ou 0–10. Já foi testado e descartado. Se um mockup ou conversa antiga
  reintroduzir score, prevalece esta decisão.
- O **Ritmo** é a assinatura visual: um heatmap de contribuições (estilo
  contribution graph do GitHub), em escala violeta. Só renderizar quando houver
  dados reais suficientes — heatmap vazio comunica o oposto do pretendido.

### Assessor é o cavalo de Troia
- O assessor de creators é o público-chave e a porta de entrada da rede.
- Ele destrava os outros três públicos (creator-empresa, profissionais criativos, marcas).
- Deve ter **categoria própria e destaque na comunicação** — não enterrado em
  "Assessoria & Gestão" misturado com PR.

### Monetização: quem paga é quem contrata
- Creator é gratuito e permanece gratuito (garante o supply side).
- Receita vem de assinatura de assessores e agências (fase 2 em diante).
- ❌ NUNCA: publicidade, destaque pago no feed, venda de dados. Conflitam com a
  proposta de reputação verificável.

### Claim profile pela porta da oportunidade
- O grafo de relacionamento é o ativo real, não o perfil isolado.
- Perfis são populados pelo assessor — mas SEMPRE ancorados em trabalho real.
- ❌ NÃO criar milhares de perfis fantasma sem nenhuma aresta de Lastro. Isso é
  base degradável e suja a proposta de reputação. Cada perfil criado deve nascer
  com pelo menos uma colaboração/prova ligada a ele.

## 4. Trilho atual — Fase 2 (aberta em 2026-07-28)

### Fase 1 — ENCERRADA (código completo, em produção)

O Módulo de Oportunidades está construído e no ar (PR #9, 7 ondas): extração de
ticket por IA, Screen 10, Lastro (prova bilateral), claim profile do assessor,
página pública `/handle`, rede tecida (oportunidade ⇄ perfil ⇄ prova), namespace
de identidade unificado. 109 testes, schema aplicado no Supabase.

⚠️ **Ressalva registrada:** a Fase 1 foi encerrada por decisão do fundador com o
fluxo autenticado ainda não executado nenhuma vez em produção (banco em 0 linhas
na data de abertura da Fase 2). O critério original da spec 02 — "o assessor usou
a Massa pra estruturar uma oportunidade real" — não foi atingido. Ver D13.

### Fase 2 — trilho atual

**Motivo da abertura:** investidor e usuários de teste aguardando a rede
utilizável. Decisão consciente do fundador em 2026-07-28 (ver D13 no log).

**Objetivo:** a rede deixa de ser single-player e passa a suportar pessoas reais
entrando, se encontrando e acumulando Lastro.

Escopo liberado agora:
- **Ativação por e-mail** — o creator vinculado recebe convite para reivindicar
  (era o growth loop adiado da Fase 1).
- **Onboarding de quem chega sozinho** — hoje só existe nó para quem publica ou é
  vinculado. Usuário de teste que loga precisa conseguir existir na rede.
- **Exploração / diretório de perfis** — encontrar quem está na rede.
- **Camada social mínima** (conexões, atividade) — antes travada por "densidade".
- **Matching por Lastro** — casar oportunidade e perfil por fatos, não por score.
- **Mapeamento assistido de creators** — sai da quarentena, mas **D7 continua
  valendo**: nenhum perfil nasce sem âncora de trabalho real.

## 5. Em QUARENTENA — não construir (anti-padrão #1)

Se eu pedir, me lembre que estão em quarentena:

- 🚫 **Curadoria educacional e clube de ferramentas** — fase 3.
- 🚫 **Identity OS** (pipeline multi-agente de identidade) — continua fora.
- 🚫 **Sistema multi-agente** (orchestrator + agentes autônomos em paralelo).
  A abertura da Fase 2 **não** libera isto automaticamente: D10 tem critérios
  objetivos próprios (volume real de oportunidades circulando, features que dão o
  que orquestrar, dataset de eval em platô). Nenhum deles foi atingido — todos
  estão em zero. Pipeline determinístico testável > enxame autônomo.
- 🚫 **Escopo fora da economia criativa** (ex.: Patteo/imobiliário) — não absorver
  sob "é tudo Feel" sem decisão registrada.

### O que a Fase 2 NÃO suspende

Estas continuam invioláveis, independentemente de fase:
- **D1** — Reputação é Lastro (fatos contáveis), nunca score.
- **D7** — nenhum perfil sem âncora de trabalho real. Vale inclusive para o
  mapeamento assistido e para qualquer onboarding novo.
- **§2** — não virar vitrine, marketplace transacional nem rede de creators.
- **Monetização** — sem publicidade, destaque pago ou venda de dados.

## 6. ANTI-PADRÃO #1 — leia isto sempre

> **O fundador tende a expandir a tese antes de executar a tese.**

Isso já aconteceu com o Identity OS, com um dashboard de produtividade que
colapsou 4 modelos de negócio num produto, e em outras iterações. É o maior risco
do projeto.

**Sua função, Claude Code, inclui me proteger disso.** Quando um pedido meu sair
do trilho da Fase 1 (seção 4), você deve, ANTES de executar:
1. Nomear que o pedido está fora do trilho da Fase 1.
2. Citar qual regra/quarentena ele cruza.
3. Perguntar se é uma reorientação consciente ou um desvio.

Não suavize. Use minhas próprias regras como argumento. "Rápido na direção errada"
é o jeito mais caro de queimar runway de fundador solo.

## 7. Régua de decisão para qualquer feature nova

Antes de construir algo novo, cruze com:
- (a) Alinha com "LinkedIn da Creator Economy" (rede + oportunidade, não vitrine)?
- (b) Cabe no trilho da Fase 1, ou é fase 2/3?
- (c) Um fundador solo executa e mantém isso?
- (d) É camada de **rede/oportunidade** (moat) ou camada de **descoberta** (commodity)?

Se a resposta empurrar para commodity, fase futura, ou exige equipe — **pare e me avise.**

## 8. Stack e arquitetura

- Next.js + Vercel (projeto **novo e isolado**). Domínio final: massahub.com.br.
- Persistência: **Supabase (Postgres)** — projeto novo, isolado.
- **Arquitetura hexagonal** (ports & adapters) — para acoplar módulos no tempo sem
  reescrever o núcleo. Respeite a separação domínio / aplicação / infraestrutura.
- **Regra dura de persistência:** o Supabase é um **adapter de repositório**, na
  borda. O DOMÍNIO NÃO conhece o Supabase — nada de `supabase` importado em entidade,
  value object ou regra de negócio. Acesso sempre via porta (interface de repositório).
  Isso mantém os testes de domínio rodando sem banco e evita ficar refém do fornecedor.
- **Ordem de construção:** modelar o domínio PRIMEIRO (entidades, regras, testes),
  e SÓ DEPOIS o adapter que persiste no Supabase. Nunca começar criando tabela —
  se o schema vier antes, o domínio vira refém do banco (o oposto da hexagonal).
- Extração de ticket: API Anthropic (Claude), também via porta/adapter. O domínio
  não conhece a Anthropic.
- **IA na Fase 1 = um agente, uma chamada.** Colar briefing → devolver ticket
  estruturado. NÃO é sistema multi-agente (ver quarentena, seção 5). Multi-agente
  resolve escala que não temos com ~19 perfis.
- Abordagem de lançamento: **SLC (Simple, Lovable, Complete)**, não MVP cru. Rede
  profissional precisa parecer viva e ter personalidade desde o dia 1.

## 9. Linguagem e tom (produto E código)

- Tudo em PT-BR. Linguagem do mercado criativo, não de SaaS B2B engessado.
- Identidade visual: paper off-white, tinta quase-preta, violeta (#6C5BFF) como
  marca, dados em mono (vocabulário GitHub). Tipografia dura (Archivo display),
  não arredondada-amigável.
- Nas nossas conversas: tom direto, de mentor/diretor, sem bajulação. Se algo
  estiver ruim, diga. Decida em vez de fazer muitas perguntas de esclarecimento.

## 10. Como trabalhar comigo (workflow Claude Code)

- Leia este arquivo e os `/docs/specs/*` antes de codar.
- Tarefa grande → me proponha um plano curto antes de executar. Espere o ok.
- Um módulo por vez. Não toque em código fora do escopo da tarefa atual.
- Branches: trabalho fora do trilho NÃO vai para `main`, mesmo que o código seja bom.
- Ao terminar, atualize o spec relevante se a implementação mudou a decisão.
- Commits pequenos e descritivos em PT-BR.

---

_Última consolidação: junho/2026. Fonte: sessão de estratégia + design dos protótipos._
_Este arquivo prevalece sobre qualquer mockup ou conversa de IA anterior._
