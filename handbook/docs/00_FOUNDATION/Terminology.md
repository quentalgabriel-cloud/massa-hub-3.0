# Terminology — Dicionário de FeelWorks

## Propósito

Este documento define termos-chave usados em FeelWorks.

Evita ambiguidade. Faz todos falarem a mesma língua.

Audiência: Todos.

---

## Core Concepts

### Assessor
Profissional que "orbita" creators. Negocia oportunidades, gerencia relacionamentos, estrutura contratos.

Exemplos: empresário de creator, gerente de carreira, produtor.

### Creator
Profissional que produz conteúdo (vídeo, áudio, foto, etc). O ativo que o assessor representa.

### Oportunidade
Briefing de uma marca ("preciso de 5 creators de beleza para campanha de skincare").

Vem de WhatsApp, email, call. FeelWorks estrutura.

### Prova
Registro de trabalho real feito por creator para uma marca.

Assinada bilateral (creator + marca confirmam).

Única unidade de reputação em FeelWorks.

### Lastro
Soma de fatos verificáveis sobre alguém.

Últimos: nº de provas, marcas distintas, marcas recorrentes, recomendações.

NÃO é score. É contagem.

### Workspace
Espaço isolado onde assessor/agência gerencia suas oportunidades e relacionamentos.

Mu-tenant. Cada workspace tem suas regras de permissão.

### Squad
Grupo de creators reunidos para uma oportunidade.

Exemplo: Oportunidade Natura precisa de Squad de [5 creators, 3 specialistas de foto, 1 coordenador].

### Papel
Função específica dentro de um squad.

Exemplo: "Creator de beleza com 50k-300k seguidores".

### Ticket
Representação estruturada de uma oportunidade.

Saída de IA (estrutura texto bruto em JSON validado).

Entrada para FeelWorks publicar/matching.

### Contexto
Informação que torna uma decisão significativa.

Exemplo: "Creator A rejeitou marca X antes" é contexto para "não sugerir A para X nova vez".

### Memória
Captura automática de padrões e aprendizados.

Exemplo: "Marca Natura prefere creators do NE" fica registrado para próxima oportunidade Natura.

### IA Adapter
Integração com Claude (ou outro LLM) para estruturação de dados.

Exemplo: `ExtratorDeTicketAnthropic` lê briefing bruto, devolve Ticket validado.

---

## Processo Concepts

### Claim Profile
Assessor adiciona creator ao sistema, lastreado em trabalho real.

Não é "registre-se livremente". É "você trabalhou com X, posso cadastrá-lo?".

### Matching
Sugestão automática de criador para oportunidade (Fase 2+).

Baseado em histórico, contexto, prefs.

### Candidatura
Creator ou assessor se manifesta interessado em oportunidade.

### Contratação
Marca escolhe creators para squad.

### Execução
Creators produzem conteúdo para oportunidade.

### Prova Final
Ambas as partes confirmam trabalho feito.

Nasce uma Prova.

---

## Filosofia Concepts

### Single-Player Value
Valor que alguém ganha usando FeelWorks sozinho, sem rede.

Assessor economiza tempo estruturando briefs (Fase 1) = single-player value.

### Network Effects
Valor que emerge quando rede fica densa.

Melhor matching, melhor reputação, melhor descoberta (Fase 2+).

### Anti-Pattern #1 — Expandir Tese Antes de Executar
Tentativa de fazer tudo (multi-agente, educação, social) antes de executar o core (oportunidades).

FeelWorks recusa isso.

---

## Quando Adicionar Termo Novo

1. Aparecer em múltiplos documentos do handbook
2. Ter significado diferente fora de FeelWorks
3. Possível confundir time/usuários

Se sim, merece aqui.

---

_Última revisão: junho/2026 | Contribuidores: Gabriel Quental_
