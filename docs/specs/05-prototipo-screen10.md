# Spec — Protótipo Screen 10 (JÁ EXISTE — não reinventar)

Status: **protótipo funcional já construído** (React + API Anthropic real).
Não recomeçar do zero. Portar as decisões abaixo para o Next.js/hexagonal.

> Existe um protótipo React funcional da tela de publicação de oportunidade
> ("Screen 10") com extração real via API Anthropic. Ele já resolveu decisões de
> produto que NÃO devem ser reinventadas. O Claude Code deve tratar isto como
> contrato existente, não como tela nova.

## O que o protótipo já definiu (manter)

### 1. Uma tela, uma função, bem feita
Assessor cola o caos à esquerda (briefing bruto como chega no grupo de WhatsApp),
o ticket nasce estruturado à direita. Nada além disso. Resistir à tentação de
empilhar features nesta tela.

### 2. Realce de origem (a "mágica auditável")
Depois de estruturar, os trechos do **texto cru** que viraram cada campo ficam
**sublinhados na cor do campo correspondente**. É o "olha de onde veio cada coisa".
Transforma a extração de caixa-preta em algo auditável pelo assessor. ESSA é a
assinatura de confiança da tela — não cortar para "simplificar".

### 3. Ticket squad-aware (múltiplos papéis)
O ticket suporta papéis separados COM quantidade, não vaga única.
Ex.: "2 creators de beleza + 1 de lifestyle" → três posições, dois papéis, não
uma vaga genérica de "3 creators". O modelo de dados precisa carregar isso.

### 4. Campo de confiança
A IA retorna um `confianca` por extração. Use-o para sinalizar ao assessor quando
o briefing está raso e pedir o que falta ANTES de publicar. É o começo de um
controle de qualidade do ticket — não descartar.

### 5. Match por Lastro, marcado como ilustrativo
A seção de perfis compatíveis usa o modelo Lastro (provas de trabalho), não nota
numérica. Com ~19 perfis na base, o match é explicitamente ILUSTRATIVO. Não fingir
match real enquanto não houver densidade — seria desonesto e mina a confiança.

## Contrato de dados do ticket (referência)

O JSON estruturado que a IA devolve é o contrato a portar. Inclui, no mínimo:
marca, budget, prazo, local/evento, entregáveis, e `squad: [{ papel, quantidade,
nicho, faixaSeguidores }]`, além de `confianca` e os offsets/trechos de origem
para o realce. Validar contra schema antes de montar o preview (ver spec 02).

## O ativo mais importante: o system prompt de extração

O system prompt que faz a extração é o ativo central do módulo. Ele NÃO se
especula no bootstrap — se constrói iterando com briefings REAIS do Gabriel.
Quanto mais textos verdadeiros passarem por ele, mais se descobre onde erra.
Trate-o como artefato vivo, versionado, com casos de teste a partir de briefings
reais. Não "finalizar" cedo.

## Como portar

- O protótipo é React de prototipagem, não código de produção. Porte o **contrato
  de dados** e a **lógica de extração**, não o componente literal.
- A chamada à Anthropic vive num adapter (ver spec 02 e CLAUDE.md seção 8).
- Mantenha as 5 decisões acima. Se for cortar alguma "para simplificar", pergunte
  ao Gabriel antes — cada uma carrega uma decisão de produto já tomada.
