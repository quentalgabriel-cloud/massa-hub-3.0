# Spec (pesquisa) — Identidade Visual de Alto Nível

> Status: **trilha de pesquisa aberta** (Trilha B). Roda em paralelo ao scaffold + domínio.
> Não bloqueia a Trilha A. Converge na Screen 10 (PROMPT 5), a primeira superfície lovable.
>
> Este documento NÃO substitui o `04-design-system.md` (tokens base já aprovados). Ele
> APROFUNDA: textura, movimento, densidade, estados, sonoridade da marca — a "alma" que
> faz o produto parecer vivo no dia 1 (princípio SLC, não MVP cru).

---

## 0. Por que este sprint existe

O `04-design-system.md` define o esqueleto: cores, fontes, raio, regra de sombra. Isso é
o suficiente para NÃO parecer genérico, mas não o suficiente para ser de **altíssimo nível**.
O que separa "competente" de "memorável" não está nos tokens — está em:
- como as coisas se movem (motion),
- o que aparece quando não há dados (estados vazios),
- a textura do papel e da tinta (granulação, profundidade sutil),
- a densidade informacional (vocabulário de ferramenta, não de vitrine),
- a consistência da personalidade (tom GitHub-criativo, não Behance, não SaaS B2B).

Este sprint produz essas definições ANTES da primeira tela de alta fidelidade, para que
ela nasça com identidade — não com identidade retrofitada depois.

---

## 1. Âncoras de direção (já decididas — não reabrir)

Da constituição e do spec 04, a direção está travada. A pesquisa opera DENTRO destes limites:

- **Referência mental: GitHub, não Behance.** Reputação por trabalho visível e verificável,
  não vitrine bonita. A UI deve sentir como ferramenta de dev de boa densidade.
- **Editorial-criativo, não SaaS arredondado-amigável.** Tipografia dura (Archivo
  comprimida). Nada de cantos de pílula, nada de ilustrações fofas corporativas.
- **Paper off-white + tinta quase-preta + violeta de marca + dados em mono.**
- **Hierarquia por contraste e tipografia, não por sombra pesada.**
- **PT-BR, linguagem do mercado criativo.** Tom direto, não engessado.

Se a pesquisa empurrar para "vitrine bonita" ou "SaaS genérico", parar — cruza a tese.

---

## 2. Entregáveis do sprint (o que sai daqui)

1. **Painel de referências e anti-referências** — 8-12 referências do que QUEREMOS sentir
   (ex: GitHub, Linear, Vercel, editoriais impressos, fanzines do mercado criativo) e
   6-8 anti-referências do que NÃO queremos (Behance, marketplaces de freela, SaaS B2B
   genérico). Cada uma com 1 linha: "o que roubar / o que evitar".

2. **Sistema de movimento (motion)** — definição de como as coisas entram, saem,
   transicionam. Duração, easing, o que anima e o que NÃO anima. Princípio proposto:
   movimento funcional e contido (revela informação, não decora). Sem bounce fofo.

3. **Estados vazios** — o mais importante e o mais esquecido. Heatmap vazio, perfil sem
   provas, mercado sem oportunidades, busca sem resultado. Cada um precisa comunicar o
   oposto de "morto". Definir a abordagem (texto + convite à ação + textura, não spinner).

4. **Textura e profundidade** — granulação do paper, se há grão sutil, como a "tinta"
   se comporta, profundidade por camadas (z-index editorial) vs sombra. Definir o limite.

5. **Vocabulário de dados (mono em ação)** — onde exatamente o IBM Plex Mono entra:
   contadores de Lastro, budgets, datas, handles, labels em caixa-alta. Especificar
   letter-spacing, casing, e o "feel" de terminal/ferramenta.

6. **Tom de microcopy** — como o produto fala. Estados de erro, confirmações, o selo
   "✓✓ assinada pelos dois lados", a frase-âncora do Lastro. PT-BR criativo, direto.

7. **Tokens estendidos** — o que o spec 04 não cobre: escala de espaçamento, escala
   tipográfica completa (tamanhos/line-heights), tokens de motion (durações/easings),
   estados de foco/hover/active, dark mode (sim/não/depois).

---

## 3. Método (como conduzir — fundador não-técnico + Claude)

Este sprint é conduzido por VOCÊ (Gabriel) com o Claude como parceiro de pesquisa. Não
precisa de código. Fluxo proposto:

```
ETAPA 1 — Coleta (você lidera)
  Você manda referências: links, prints, Reels, sites que te fazem sentir "é isso".
  Eu analiso cada uma (incluindo vídeos, via /watch) e extraio o PORQUÊ funciona.

ETAPA 2 — Destilação (eu lidero, você valida)
  Eu sintetizo padrões recorrentes das suas referências em princípios nomeados.
  Ex: "profundidade por camada de papel, não por sombra" / "movimento que revela dado".

ETAPA 3 — Definição (juntos)
  Fechamos cada um dos 7 entregáveis acima como decisão. Vira adendo ao spec 04.

ETAPA 4 — Prova visual (na convergência, Screen 10)
  A primeira tela real (Screen 10) aplica tudo. Aí vemos a identidade encontrar conteúdo
  de verdade e ajustamos o que quebrar.
```

---

## 4. Quando converge com a Trilha A

```
Trilha A (Claude Code):   scaffold → domínio (Prova/Lastro/Oportunidade) → adapters
Trilha B (Gabriel + eu):  coleta → destilação → definição
                                                      ↓
                              CONVERGÊNCIA: Screen 10 (PROMPT 5)
                              — primeira tela lovable veste a identidade madura
```

A identidade NÃO precisa estar 100% fechada para o domínio avançar. Só precisa estar
fechada antes de PROMPT 5 (a primeira tela de alta fidelidade).

---

## 5. Régua de qualidade (como saber que está bom)

Antes de fechar o sprint, cada entregável passa por:
- (a) Sente GitHub/ferramenta, ou sente vitrine/Behance? (deve ser o primeiro)
- (b) Um estado vazio comunica "vivo e convidativo" ou "morto"? (deve ser o primeiro)
- (c) O movimento revela informação ou só decora? (deve revelar)
- (d) Um fundador solo consegue manter isso sem um time de design? (deve conseguir)

Se qualquer resposta cair no lado errado, refazer aquele entregável.
