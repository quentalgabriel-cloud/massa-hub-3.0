# PROMPTS — como entrar no Claude Code de forma inteligente

Ordem de uso. Copie e cole um de cada vez. Espere terminar antes do próximo.

---

## PASSO 0 — Antes de tudo (você, sem o Claude Code)

1. Crie o repositório **novo** da Massa Hub (limpo, do zero).
2. Crie projetos **novos e isolados** no Supabase e no Vercel (não forks).
3. Coloque `CLAUDE.md` na **raiz** do repositório.
4. Coloque a pasta `docs/` (specs + decisões) na raiz.
5. Abra o Claude Code na pasta do projeto.

> Repo novo = a única verdade é o CLAUDE.md e as specs. Sem resíduo do Identity OS,
> sem branch trocada, sem tentação. Esse limpo vale ouro.

---

## PROMPT 0.5 — Scaffolding do projeto novo (só na primeira sessão)

```
Este é um repositório novo, do zero. Antes de qualquer feature, leia o CLAUDE.md
e os docs/specs/. Depois proponha (sem executar ainda) a estrutura inicial:

- Next.js com a separação da arquitetura hexagonal: onde ficam domínio, aplicação
  (casos de uso) e infraestrutura (adapters). O domínio deve ser isolável e testável
  sem Next, sem Supabase e sem Anthropic.
- Onde entram os adapters: Supabase (repositório), Anthropic (extração), auth Google.
- Setup de testes do domínio.
- Aplicar os tokens visuais de docs/specs/04-design-system.md no tema base.

Me mostre a árvore de pastas proposta e justifique em 1 linha cada camada.
Só faça o scaffold depois do meu ok. Não crie nenhuma tabela no Supabase ainda.
```

---

## PROMPT 1 — Orientação inicial (sempre o primeiro de cada sessão grande)

```
Leia o CLAUDE.md na raiz e todos os arquivos em docs/specs/ e docs/decisoes/
antes de qualquer coisa. Depois me responda, em no máximo 10 linhas:

1. Qual é o trilho atual da Fase 1 e o que está em quarentena.
2. Qual o estado atual do código deste repositório (o que já existe de fato).
3. Onde, na arquitetura hexagonal atual, entraria o módulo de oportunidades.

Não escreva código ainda. Só quero confirmar que você entendeu o projeto e o
estado real do repo antes de planejarmos.
```

---

## PROMPT 2 — Auditoria do que já existe

```
Faça um mapa do código atual: estrutura de pastas, entidades de domínio já
modeladas, telas/rotas existentes, e como a autenticação e os perfis estão
implementados hoje. Aponte o que está alinhado com as specs e o que diverge.

Entregue como um documento curto em docs/estado-atual.md. Ainda não altere
nada de código.
```

---

## PROMPT 3 — Fechar o modelo de dados do Lastro (antes de qualquer UI)

```
Com base em docs/specs/01-reputacao-lastro.md, modele as entidades de domínio
Prova e Lastro na arquitetura hexagonal, sem UI ainda. Inclua:
- entidades e value objects do domínio (Prova, Assinatura, agregados de Lastro)
- as portas necessárias (interface de repositório, etc.)
- testes de domínio das regras (prova só é "verificada" com ≥2 assinaturas;
  Lastro deriva de fatos contáveis, nunca de nota)

IMPORTANTE sobre persistência:
- NÃO comece criando tabela no Supabase. Modele o domínio primeiro.
- O Supabase é um ADAPTER de repositório, na borda. O domínio não pode importar
  nem conhecer o Supabase. Acesso só via a porta (interface).
- Só depois do domínio + testes passando, implemente o adapter Supabase que
  satisfaz a porta, e o schema SQL correspondente.

Me proponha o plano em tópicos primeiro. Só implemente depois do meu ok.
Lembre: nada de score numérico em lugar nenhum.
```

---

## PROMPT 4 — Módulo de oportunidades: domínio + extração por IA

```
Com base em docs/specs/02-modulo-oportunidades.md, construa o núcleo do módulo
de oportunidades:
- entidade Oportunidade (com squad e múltiplos papéis) no domínio
- a porta de saída para extração por IA (o domínio NÃO conhece a Anthropic)
- um adapter que chama a API da Anthropic e valida a saída contra um schema
  antes de devolver (nunca confiar cegamente no texto do modelo)
- testes com o adapter mockado

Plano em tópicos primeiro, ok antes de implementar.
```

---

## PROMPT 5 — Tela de publicação do ticket (Screen 10)

```
ATENÇÃO: já existe um protótipo funcional desta tela. Leia primeiro
docs/specs/05-prototipo-screen10.md — várias decisões de produto já foram tomadas
e NÃO devem ser reinventadas (realce de origem, ticket squad-aware, campo de
confiança, match por Lastro ilustrativo).

Com isso em mente, implemente a tela de publicação de oportunidade (a "Screen 10")
conforme as specs 02 e 05:
- campo de texto livre para o briefing bruto
- botão "Estruturar com IA" → processamento → preview editável do ticket
- realce: trechos do texto cru que viraram campo, sublinhados na cor do campo
- ticket squad-aware (papéis separados com quantidade)
- campo de confiança que sinaliza briefing raso antes de publicar
- nada publica sem revisão humana
- aplicar os tokens visuais de docs/specs/04-design-system.md

Use a arquitetura e componentes já existentes. Plano de componentes antes de codar.
```

---

## PROMPT 6 — Mercado de oportunidades (workspace)

```
Implemente o mercado de oportunidades: workspace de dois painéis no desktop
(lista + detalhe), e fluxo de duas telas no mobile, conforme spec 02 e as
regras de responsividade da spec 04. Inclua a auditoria de overflow horizontal
em 360/390px antes de considerar pronto.
```

---

## PROMPT recorrente — Freio de escopo (use quando bater a vontade de expandir)

```
Antes de fazer isto, cruze com a régua da seção 7 do CLAUDE.md e com a lista de
quarentena. Isto é trilho da Fase 1 ou é expansão de tese? Se for expansão, me
diga qual regra cruza e por que eu deveria parar — não execute só porque pedi.
```

---

## PROMPT recorrente — Fim de sessão

```
Resuma o que mudou nesta sessão em 5 linhas. Se alguma implementação alterou uma
decisão registrada nas specs, atualize o spec correspondente e o docs/decisoes/log.md.
Faça commits pequenos em PT-BR. Liste o que ficou pendente para a próxima sessão.
```

---

## Dica de uso

- Nunca peça "constrói o produto inteiro". Sempre um módulo por vez, na ordem acima.
- Se o Claude Code começar a construir algo fora do trilho, use o freio de escopo.
- O CLAUDE.md instrui o Claude Code a te avisar quando você sair do trilho — deixe
  ele fazer esse papel. Esse é o ponto: ele te protege do anti-padrão #1.
