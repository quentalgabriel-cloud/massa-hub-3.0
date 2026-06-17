# Spec — Módulo de Oportunidades (PRIORIDADE FASE 1)

Status: **construir agora** · É o produto de entrada e o moat.

## Por que é a prioridade

É o único mecanismo que entrega valor single-player antes de a rede ter densidade.
O assessor recebe valor sozinho (estrutura um briefing caótico em ticket organizado)
mesmo que a rede ainda seja pequena. É o que muda a natureza do produto de
"diretório" para "rede com oportunidade".

## Quem é o cliente (dados que orientam o produto)

Dados das pesquisas YOUPIX/Nielsen que ancoram as decisões de público e de fluxo:
- **67% das marcas usam agência** (sobe para 95% nos budgets maiores). O alvo B2B
  é a AGÊNCIA e o ASSESSOR, não a marca direto. O ticket entra pela mão deles.
- **74% dos creators não têm representação; 76% querem.** Cria a dinâmica bilateral
  onde o assessor paga e o creator não — e onde há demanda real por estrutura.
- **70% das campanhas ainda são pontuais** (não always-on). Isso AUMENTA a
  frequência de montagem de squad — ou seja, aumenta a utilidade da plataforma e a
  formação de hábito. Cada campanha pontual é uma nova oportunidade estruturada.

> Existe um protótipo funcional desta tela (Screen 10). Antes de construir, leia
> docs/specs/05-prototipo-screen10.md — várias decisões já foram tomadas lá.

## Fluxo central — o ticket estruturado por IA

1. Assessor/agência cola um texto bruto como ele chegou (WhatsApp, e-mail, áudio
   transcrito). Ex.: "Oi! Tô com um job da Natura pra setembro, campanha de skincare,
   preciso de uns 5 creators do NE, 50k–300k, budget 25 mil, 1 reels + 3 stories +
   evento em Recife dia 12/09."
2. A IA (API Anthropic, via adapter) extrai e estrutura: marca, budget, nº de
   creators, região, faixa de seguidores, nicho, entregáveis, prazo, evento.
3. Retorna um **ticket estruturado** com suporte a **squad e múltiplos papéis**.
4. O assessor **revisa os campos** antes de publicar (a IA propõe, humano confirma).
5. Publicar → o ticket entra no mercado de oportunidades e notifica perfis compatíveis.

## Tela de publicação ("Screen 10")

- Campo grande de texto livre para o briefing bruto.
- Botão "Estruturar com IA" → estado de processamento → preview do ticket estruturado.
- Preview editável (campos como chips/inputs). Nada publica sem revisão humana.
- Ação final: "Publicar ticket".

## Mercado de oportunidades (workspace)

- Layout de dois painéis no desktop (lista de tickets + detalhe), estilo
  GitHub Issues / LinkedIn Recruiter. NÃO um quadro passivo de vagas.
- No mobile: lista em tela cheia → toque abre o detalhe em tela própria com voltar.
- Detalhe do ticket mostra campos estruturados: budget, prazo, perfil buscado,
  local, entregáveis. Ações: "Candidatar meu perfil" e "Indicar alguém da rede".
- Deixar visível que o ticket foi estruturado por IA e revisado pelo autor.

## Modelo de dados (esboço)

```
Oportunidade {
  id, autor (assessor/agência ref), marca, budget, prazo, local,
  perfilBuscado { qtd, nicho, faixaSeguidores, regiao },
  entregaveis: [string],
  squad: [ Papel { funcao, qtd } ],   // múltiplos papéis
  status: aberta | em_selecao | fechada,
  candidaturas: [ref],
  origem: { textoBruto, estruturadoPorIA: true, revisadoPeloAutor: bool }
}
```

## Arquitetura

- Extração via IA fica num **adapter** (porta de saída). O domínio "Oportunidade"
  não conhece a Anthropic. Permite trocar o provedor ou mockar em teste.
- Validar a saída da IA contra um schema antes de montar o preview. Nunca confiar
  cegamente no texto do modelo.

## Hipótese a validar (não esquecer)

O que valida a Fase 1 NÃO é "assessor cadastrou sua rede". É **"assessor usou a
Massa para receber/estruturar uma oportunidade real"**. O claim profile dos creators
acontece como consequência de um job concreto, não de um cadastro abstrato.
