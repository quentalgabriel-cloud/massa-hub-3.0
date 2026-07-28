# Plano Executivo — Fase 1 | 15 Caminhos → 5 Finalistas

Análise estratégica de 15 possíveis implementações para a Fase 1. Cada uma avaliada em risco/potencial. Filtradas por critérios rigorosos até 5 finalistas que executaremos em paralelo sincronizado.

---

## Parte 1: Os 15 Caminhos (Brainstorm Completo)

### Caminho 1: Modelo Tradicional — Sequência Hexagonal (Beatriz → Rodrigo+Marina → Letícia+Cairo)

**Descrição:** Trilho atual do CLAUDE.md. Sequência pura: domínio (Beatriz) → infra+aplicação paralelo (Rodrigo+Marina) → UI+IA paralelo (Letícia+Cairo). Sincronizações semanais em wed/fri.

**Risco:** 🟡 **Médio**
- Depende de Beatriz não reabrir entidade depois que Rodrigo/Marina saem
- Cairo pode desenhar schema para IA sem saber exatamente o que Marina quer

**Potencial:** 🟢 **Alto**
- Arquitetura defensável (hexagonal pura)
- Testes isolados em cada camada
- Reutilizável para Fase 2+

**Custo:** ~6 semanas (4 base + 2 buffers)

**Score:** 8.5/10

---

### Caminho 2: Lean — Sem IA, Sem UI Polish

**Descrição:** Pula Cairo inteiramente na Fase 1. Beatriz → Rodrigo+Marina → Letícia (tela esqueleto, sem design). Extração de ticket fica para Fase 2. Testes a tudo isolado.

**Risco:** 🟢 **Baixo**
- Menos surface area
- Menos variáveis
- Mais fácil identificar bugs

**Potencial:** 🟡 **Médio**
- Funcional, mas feio
- **Valida tese central sem IA complicando**: reputação por prova, assessor como porta
- Se validar em 3w, sabemos que IA é "nice-to-have", não "need-to-have"

**Custo:** ~3 semanas

**Score:** 8.0/10

---

### Caminho 3: Inverso — UI-First Design (Letícia Lidera)

**Descrição:** Letícia desenha tela/fluxo **primeiro** (mockup, sem código). Beatriz molda domínio para caber no fluxo que Letícia propõe. Rodrigo adapta DB. Marina orquestra.

**Risco:** 🔴 **Alto**
- Risco arquitetural: UI driving domain (commodity layer determina moat)
- Violação de D1 (domínio deve liderar)
- Vai e volta frequente = retrabalho

**Potencial:** 🔴 **Baixo**
- Pode parecer mais bonito, mas perde defensibilidade
- Historicamente refém da estética (mudanças de design quebram lógica)

**Custo:** ~7 semanas (vai e volta)

**Score:** 2.0/10 — **DESCARTADO**

---

### Caminho 4: IA-First Paralelo (Cairo Começa com Beatriz)

**Descrição:** Cairo desenha prompt + schema Zod em **paralelo com Beatriz** (não espera). Quando Beatriz fecha Perfil, Cairo já tem a extração testada. Rodrigo integra.

**Risco:** 🟡 **Médio**
- Cairo pode desenhar schema para entidade que muda (retrabalho)
- Sincronização chave na semana 1 (seg ou ter)

**Potencial:** 🟡 **Médio-Alto**
- Economiza ~1 semana se sincronizar bem
- Valida se IA é acelerador real ou ralentador

**Custo:** ~5 semanas (1 economizada)

**Score:** 7.5/10

---

### Caminho 5: Dual-Track — PerfilAssessor + PerfilCreator (Duas Entidades)

**Descrição:** Em vez de 1 Perfil genérico, cria PerfilAssessor + PerfilCreator (duas entidades, duas migrations, duas jornadas UI). Cada um específico.

**Risco:** 🔴 **Alto**
- 2x complexity
- Beatriz tira 80 testes (2 entidades)
- Rodrigo 2x migrations + RLS complexa
- Letícia duplica telas
- Maior chance de inconsistência

**Potencial:** 🔴 **Baixo**
- Genérico é mais poderoso que específico em rede emergente
- Violação da simplicidade (YAGNI)

**Custo:** ~8 semanas (2x parallelism, 2x escopo)

**Score:** 2.5/10 — **DESCARTADO**

---

### Caminho 6: Third-Party Auth Expansion (Google + GitHub + LinkedIn)

**Descrição:** Multi-provider OAuth. Cada provider = segmentação (dev no GitHub, creator no Google, marca no LinkedIn).

**Risco:** 🔴 **Alto**
- Novos adapters de auth
- Vercel/Supabase limites de redirect URIs
- Security review crítica
- Suportar 3x é 3x QA

**Potencial:** 🟡 **Médio**
- Segmentação é commodity (todo app oferece)
- Não diferencia a rede

**Custo:** +2 semanas (scope creep)

**Score:** 3.5/10 — **DESCARTADO**

---

### Caminho 7: Email Activation Loop (Ativa Fase 2 Cedo)

**Descrição:** Adiciona Resend/SendGrid para notificar creator que foi vinculado. "Você foi vinculado a [oportunidade], clique para reivindicar". Acelera claim loop.

**Risco:** 🟡 **Médio**
- Novo vendor (Resend)
- Novo adapter para template de email
- Unsubscribe flow (legal)
- Bounce handling

**Potencial:** 🟡 **Médio-Alto**
- Ativa faster loop de claim (de "dias de espera" para "horas")
- Retenção do creator

**Custo:** +1 semana (email é simples se usar Resend template)

**Score:** 7.0/10

---

### Caminho 8: Gamification Micro — Badges de Prova

**Descrição:** Renderiza Prova não como texto, mas como badge visual (assinado por marca A, confiança 85%, Jan/2026). Letícia desenha componente bonito.

**Risco:** 🟡 **Baixo-Médio**
- Scope pequeno (só UI)
- Não toca domínio

**Potencial:** 🟡 **Médio**
- Comunica status melhor que texto
- Mas é cosmético (não resolve problema real)

**Custo:** +0.5 semana (Letícia only)

**Score:** 7.0/10

---

### Caminho 9: Dashboard do Assessor (KPIs Emergentes)

**Descrição:** Dashboard com métricas: "Quantas oportunidades publiquei esta semana? Quantos creators vinculados? Quantas provas assinadas?". S2 (coordenação visual).

**Risco:** 🟡 **Médio**
- Novo padrão de página
- Agregações em DB (performance com números pequenos)
- Potencial de ser inútil se números muito baixos

**Potencial:** 🟡 **Médio-Alto**
- Dá feedback visual de "está funcionando" (psicológico)
- Retenção do assessor (vira "viciado" em ver números crescerem)

**Custo:** +1.5 semanas

**Score:** 7.5/10

---

### Caminho 10: Mobile-First (React Native / Expo)

**Descrição:** App nativo (Expo) para creator reivindicar/explorar. Web = assessor só.

**Risco:** 🔴 **Alto**
- Novo stack (TypeScript/Expo, não Next.js)
- Duplica Letícia (UI web + mobile)
- Novo vendor (EAS)
- QA duplicado

**Potencial:** 🔴 **Baixo-Médio**
- Creator pode usar mobile (bom), mas é commodity
- Toda app é mobile agora
- Não diferencia a rede

**Custo:** +4 semanas (novo stack + QA)

**Score:** 2.0/10 — **DESCARTADO**

---

### Caminho 11: Email Verification Obrigatória (Segurança)

**Descrição:** Creator verifica email antes de reivindicar (click link). Barreira anti-spam, anti-bot.

**Risco:** 🟢 **Baixo**
- Padrão da indústria
- Simples implementar

**Potencial:** 🟡 **Médio**
- Reduz spam/bot
- Mas adiciona friction (creator pode não verificar)

**Custo:** +0.5 semana (Rodrigo: campo + constraint; Letícia: tela)

**Score:** 6.5/10

---

### Caminho 12: Monetização Cedo — Stripe Billing (Assessor Paga)

**Descrição:** Assessor paga $X/mês para usar. Stripe + planos + billing portal. Gera receita na Fase 1.

**Risco:** 🔴 **Alto**
- PCI compliance (complexo)
- Tax handling por país
- Chargeback logic
- Prematuramente complexo para rede tiny

**Potencial:** 🟡 **Médio**
- Gera receita cedo (psicológico + real)
- Mas pode afastar assessor sem density (network effect não funciona se pagar e ninguém usa)

**Custo:** +3 semanas (Rodrigo: schema; Marina: checkout; Letícia: billing page)

**Score:** 3.0/10 — **DESCARTADO**

---

### Caminho 13: Multi-Perfil Claim (1 Usuário ↔ N Perfis)

**Descrição:** Creator pode reivindicar MÚLTIPLOS perfis na mesma oportunidade (criados por assessores diferentes). Hoje: 1 usuário → 1 perfil. Novo: 1 usuário → N perfis.

**Risco:** 🟡 **Médio-Alto**
- Muda invariante D7 (qual origem prevalece?)
- Testes complexos
- Pode não ser preciso para Fase 1

**Potencial:** 🟡 **Médio**
- Realístico (creator trabalha com múltiplos assessores)
- Mas é edge case (raro na Fase 1 com ~50 opps)

**Custo:** +1.5 semanas (Beatriz: invariante; Rodrigo: queries; testes)

**Score:** 4.5/10

---

### Caminho 14: Observabilidade & Tracing (Honeycomb / Datadog)

**Descrição:** Tracing distribuído. Cada ação deixa trace: usuário clica → action → use case → repo → DB → volta. Debugável visualmente.

**Risco:** 🟡 **Médio**
- Novo vendor (Honeycomb)
- Overhead mínimo de performance
- SDK integration

**Potencial:** 🟡 **Médio-Alto**
- Problema real: "algo demora, não sei onde"
- Observabilidade resolve (infraestrutura robusta)
- Não é feature, é suporte

**Custo:** +1 semana (infra only, Marina/Letícia não tocam)

**Score:** 6.5/10

---

### Caminho 15: Ritmo Âmbar (Heatmap Visual como Assinatura)

**Descrição:** Renderiza "Ritmo" (heatmap contribution-graph-style) desde dia 1. Âmbar (cor quente) em vez de violeta. Foco em "reputação visual emergente" como diferencial.

**Risco:** 🟡 **Médio**
- Heatmap vazio comunica "ninguém trabalhou aqui" (ruim)
- Precisa de dados mínimos (3+ provas) para não parecer morto

**Potencial:** 🟡 **Médio-Alto**
- Visual é memorable
- Diferencia de "tabela boring"
- Ref: CLAUDE.md (Ritmo é assinatura)

**Custo:** +0.5 semana (Letícia renderiza; Cairo/Beatriz calcula dados)

**Score:** 7.5/10

---

## Parte 2: Matriz de Avaliação

| # | Caminho | Risco | Potencial | Alinhamento D1-D11 | Custo | Score | Status |
|---|---------|-------|-----------|-------|-------|--------|--------|
| 1 | Tradicional | 🟡 Médio | 🟢 Alto | 🟢 Perfeito | 6w | **8.5** | ✅ |
| 2 | Lean | 🟢 Baixo | 🟡 Médio | 🟢 Perfeito | 3w | **8.0** | ✅ |
| 3 | Inverso (UI-First) | 🔴 Alto | 🔴 Baixo | 🔴 Violar | 7w | 2.0 | ❌ |
| 4 | IA-First Paralelo | 🟡 Médio | 🟡 Médio-Alto | 🟢 Compatível | 5w | **7.5** | ✅ |
| 5 | Dual-Track | 🔴 Alto | 🔴 Baixo | 🟡 Questionável | 8w | 2.5 | ❌ |
| 6 | Multi-Auth | 🔴 Alto | 🟡 Médio | 🟡 Scope-Creep | 8w | 3.5 | ❌ |
| 7 | Email Loop | 🟡 Médio | 🟡 Médio-Alto | 🟢 Compatível | 4w | **7.0** | ✅ |
| 8 | Badges UI | 🟡 Baixo-Médio | 🟡 Médio | 🟢 Polish | 3.5w | 7.0 | ⚠️ |
| 9 | Dashboard Assessor | 🟡 Médio | 🟡 Médio-Alto | 🟢 Compatível | 4.5w | **7.5** | ✅ |
| 10 | Mobile (Expo) | 🔴 Alto | 🔴 Baixo-Médio | 🟡 Commodity | 10w | 2.0 | ❌ |
| 11 | Email Verif | 🟢 Baixo | 🟡 Médio | 🟢 Compatível | 3.5w | 6.5 | ⚠️ |
| 12 | Stripe Billing | 🔴 Alto | 🟡 Médio | 🟡 Prematura | 9w | 3.0 | ❌ |
| 13 | Multi-Perfil | 🟡 Médio-Alto | 🟡 Médio | 🟡 Edge Case | 4.5w | 4.5 | ❌ |
| 14 | Observabilidade | 🟡 Médio | 🟡 Médio-Alto | 🟢 Infra | 4w | **6.5** | ⚠️ |
| 15 | Heatmap Âmbar | 🟡 Médio | 🟡 Médio-Alto | 🟢 Compatível | 3.5w | **7.5** | ✅ |

---

## Parte 3: Critérios de Filtragem (4 Filtros Sucessivos)

### Filtro 1: Alinhamento com Constituição (D1-D11)

**Regra:** Qualquer caminho que viole decisão central é **eliminado**.

**Resultado:** 
- ❌ Caminho 3 (UI-First viola D1 — domínio primeiro)
- ❌ Caminho 5 (Dual-Track expande tese antes de executar)
- ❌ Caminho 10 (Mobile é commodity, não moat)

**Sobreviventes:** 12 caminhos

---

### Filtro 2: Relação Custo-Benefício (Esforço vs. Valor)

**Regra:** Caminho custando >5w só passa se Potencial=Alto. Não toleramos 8+ semanas em especulação.

**Resultado:**
- ❌ Caminho 6 (8w, potencial médio)
- ❌ Caminho 12 (9w, monetização prematura)
- ❌ Caminho 13 (4.5w, edge case, valor baixo)

**Sobreviventes:** 9 caminhos

---

### Filtro 3: Impacto Diferencial (Moat ou Retenção?)

**Regra:** Caminho deve entregar **UM** dos dois: (a) diferencial competitivo (moat), OU (b) retenção/engagement loop.

**Resultado:**
- ⚠️ Caminho 8 (badges é cosmético, nem moat nem retenção real)
- ⚠️ Caminho 11 (email verif é standard de segurança, não diferencial)
- ⚠️ Caminho 14 (observabilidade é suporte, não feature)

**Sobreviventes:** 7 caminhos, com 3 borderline

---

### Filtro 4: Velocidade de Aprendizado (Time-to-Insight)

**Regra:** Qual caminho nos deixa **aprender mais** sobre a tese em 3-4w?

**Ranking de Aprendizado:**
1. **Caminho 1 (Tradicional):** Valida TUDO (domínio, infra, app, UI, IA). Score 10.
2. **Caminho 2 (Lean):** Valida tese central (prova, assessor) sem IA. Score 9.
3. **Caminho 4 (IA-First):** Valida IA como acelerador. Score 8.
4. **Caminho 7 (Email Loop):** Valida engajamento. Score 8.
5. **Caminho 9 (Dashboard):** Valida feedback visual. Score 7.
6. **Caminho 15 (Heatmap):** Valida assinatura visual + reputação. Score 7.

---

## Parte 4: Os 5 Finalistas (Seleção Rigorosa)

### **FINALISTA #1: Caminho 1 — Modelo Tradicional (Sequência Hexagonal)**

**Por Quê:** 
- Valida tudo (domínio, infra, app, UI, IA) em paralelo sincronizado
- Risco aceitável (médio, mitigável com PRs com lock)
- Alinhado 100% com D1-D11
- Baseline confiável + reutilizável em Fase 2

**SLA:** 6 semanas, testes verdes, arquitetura defensável

**Mitigação de Risco:** Beatriz + Rodrigo/Marina fazem sync a wed (pre-commit Beatriz ≈ "entidade freezada"; só Rodrigo/Marina podem comentar, não mudar)

**Saída Esperada:** Perfil + claim full stack (domínio até UI); IA testada isoladamente

---

### **FINALISTA #2: Caminho 2 — Lean (Sem IA, Tela Esqueleto)**

**Por Quê:** 
- 3 semanas (rápido)
- Testa **tese central** sem IA complicando: reputação por prova, assessor como porta
- Se validar em 3w, sabemos que IA é "nice-to-have", não "need-to-have"
- Low-risk: menos variáveis

**SLA:** 3 semanas, mínimo funcional (feio é ok)

**Saída Esperada:** Perfil + claim function; tela sem polish; testes all layers; IA adiado

**Insight:** Se Lean validar, cortamos 3w de Cairo e ganhamos tempo para Fase 2 (monetização, dashboard)

---

### **FINALISTA #3: Caminho 4 — IA-First Paralelo (Cairo com Beatriz)**

**Por Quê:** 
- Cairo trabalha com Beatriz (não espera)
- Economiza ~1w se sincronizar bem
- Valida se IA é acelerador real
- 5w total (economiza 1 vs. Tradicional)

**SLA:** 5 semanas, IA testada com schema Zod

**Sincronização Crítica:** Ter/Wed na semana 1 (Cairo + Beatriz sincronizam sobre nome de campos, tipos esperados)

**Saída Esperada:** Perfil + IA prontos; Marina integra ambos; Lucas testa

**Insight:** Se IA + domínio sincronizam bem, é proof que parallelismo funciona

---

### **FINALISTA #4: Caminho 9 — Dashboard do Assessor (Retenção Loop)**

**Por Quê:** 
- Retenção é invisível (assessor sai se não vê "funcionando")
- KPIs (opps publicadas, creators vinculados, provas assinadas) = feedback psicológico
- +1.5w sobre base (combinável com qualquer outro finalista)
- S2 (coordenação) — papel que falta visualizado

**SLA:** 4.5 semanas extra (7.5w sobre Lean, 4.5w sobre Tradicional se paralelo)

**Combinação:** Roda em paralelo com qualquer finalista (não bloqueia ninguém)

**Saída Esperada:** Tela de dashboard, queries agregadas, endpoint API

**Insight:** "Ver números crescerem" mantém assessor engajado (behavioral economics)

---

### **FINALISTA #5: Caminho 15 — Heatmap Âmbar (Ritmo Visual)**

**Por Quê:** 
- Diferencial visual (GitHub-like proof contribution)
- "Reputação visual" é moat (ownable, memorável)
- +0.5w (Letícia renderiza; Cairo/Beatriz calcula)
- Ref CLAUDE.md seção 3 (Ritmo é assinatura)

**SLA:** 3.5w sobre Lean (3.5w extra sobre base)

**Combinação:** Roda em paralelo com Letícia (UI phase)

**Saída Esperada:** Heatmap component, data calculation, visual test

**Insight:** Se criador vir heatmap (mesmo vazio) no perfil, comunica "aqui tem prova" (vs. "tabela boring")

---

## Parte 5: Sequência de Execução (5 Finalistas em Paralelo Sincronizado)

### **Timeline Proposto: 7 Semanas Totais**

```
SEMANA 1-3: CICLO RÁPIDO (Lean Validation)
├─ Beatriz: Perfil + invariante D7 + 20 testes
├─ Rodrigo: Migration + RLS + adapter (sem IA)
├─ Marina: ReivindicarPerfil + VincularCreatorAoSquad (sem IA)
├─ Letícia: Tela básica (sem polish, sem design)
└─ Cairo: [WAITING] observa se IA será necessário

→ Saída: Lean pronto. Testa tese central. Verifica se IA é need-to-have.

SEMANA 2-4: PARALELO SINCRONIZADO (IA-First + Base)
├─ (Paralelo A) Cairo + Beatriz: Schema Zod + prompt finalizados
├─ (Paralelo B) Rodrigo: Expande migration (testes, constraints)
├─ (Paralelo C) Marina: Integra Cairo schema (se Lean validar que precisa)
├─ (Paralelo D) Letícia: Polish UI + componentes
└─ Sincronização: Ter (Cairo↔Beatriz), Wed (todos)

→ Saída: IA integrada. UI polida. Testes verdes.

SEMANA 4-5: RETENÇÃO + VISUAL (Dashboard + Heatmap)
├─ Marina: Calcula dados para dashboard + heatmap (queries)
├─ Letícia: Renderiza dashboard page + heatmap component
└─ Cairo: Valida dados calculados (confiança, metadata)

→ Saída: Dashboard + Heatmap prontos. Assessor vê "está funcionando".

SEMANA 6-7: INTEGRAÇÃO + QA
├─ Todos: E2E (usuário cria opp → vincula creator → creator reivindica → vê prova)
├─ Rodrigo: Testa RLS edge cases, migration em staging
├─ Letícia: Cross-browser test, mobile responsivo
└─ Vercel: Deploy preview, monitoramento

→ Saída: Tudo verde. Pronto para produção.

RESULTADO: 7w, todos 5 finalistas rodando, tese validada.
```

---

## Parte 6: Por Que Estes 5?

| Finalista | Razão | Trade-off |
|-----------|-------|-----------|
| 1 (Tradicional) | Valida TUDO. Reutilizável. | Mais longo (6w). |
| 2 (Lean) | Mais rápido (3w). Testa tese core. | Feio. Sem IA. |
| 4 (IA-First) | Paralela. Economiza 1w. | Sincronização crítica. |
| 9 (Dashboard) | Retenção invisível. Psicológico. | +1.5w mas paralelo. |
| 15 (Heatmap) | Diferencial visual. Ownable. | +0.5w, precisa de dados. |

---

## Parte 7: Descartados (Por Quê Não)

| # | Caminho | Razão Descarte |
|---|---------|---|
| 3 | UI-First | Viola D1 (domínio primeiro). Historicamente retrabalho. |
| 5 | Dual-Track | 2x complexity, 8w, genérico é mais poderoso. |
| 6 | Multi-Auth | Scope creep (+2w), não diferencia rede. |
| 10 | Mobile | Novo stack, 10w, commodity. |
| 12 | Stripe | Prematura monetização, 9w, pode afastar assessor. |
| 13 | Multi-Perfil | Edge case (raro Fase 1), +1.5w, D7 muda. |

---

## Parte 8: Cronograma Detalhado (Semana a Semana)

### **SEMANA 1: Lean — Fundação Domínio + Infra Mínimo**

**Beatriz (40h)**
- Entidade Perfil: estado + origem + invariante D7 ✅
- Value object Handle ✅
- 20 testes (happy path + D7 violation) ✅
- Porta PerfilRepositorio (interface) ✅

**Rodrigo (35h)**
- Migration `20260722000001_perfis.sql` idempotent ✅
- CHECK constraint para D7 ✅
- PerfilRepositorioSupabase adapter (mock DB teste) ✅
- RLS draft (não deploy ainda)

**Marina (30h)**
- VincularCreatorAoSquad use case (sem IA) ✅
- ReivindicarPerfil use case ✅
- Testes com repo fake ✅

**Letícia (20h)**
- Tela `/reivindicar/[perfilId]` (skeleton, sem CSS)
- BotaoReivindicar component (basic states: idle, loading, ok, error)

**Cairo (5h)**
- Observa (não codifica). Qual IA seria necessária para extrair ticket?

**Outcome:** Lean green, tese central validada, IA decision point claro.

---

### **SEMANA 2: IA-First Paralelo + Marina Orquestração**

**Beatriz (5h)**
- Code review PRs (Rodrigo, Marina). Congelada (domínio imutável agora).

**Rodrigo (30h)**
- Expande migration (testes, trata null handling)
- RLS production ready (deny-by-default, pessoa vê próprio)
- PerfilRepositorioSupabase integração com Supabase real

**Marina (40h)**
- Integra Rodrigo adapter (ReivindicarPerfil chama repo real)
- Orquestração: reivindicar = fetch perfil + chamar .reivindicar() + salvar
- Testes com Supabase mock (testcontainers)

**Cairo (35h)**
- Prompt "extrair-ticket.md" (versionado em Git)
- Schema Zod: marca, budget, papeis[], confianca
- Testes com 10 exemplos reais (WhatsApp snippets)
- Fallback: timeout → ErrorExtracao

**Letícia (20h)**
- Polish tela reivindicação (CSS, estados visuais)
- Preparar tela de "vincular creator a squad" (in opportunity editor)

**Outcome:** IA testada, domínio + app integrados, UI básica green.

---

### **SEMANA 3: UI Polish + Integration E2E**

**Beatriz (0h)**
- (Congelada)

**Rodrigo (15h)**
- Migration apply em staging Supabase
- RLS tests (pessoa tenta ver outro perfil → negado)
- Fallback handling (DB error → application error)

**Marina (25h)**
- Integra IA se decidido (VincularCreatorAoSquad chama Cairo)
- Error translation (DB error "unique constraint" → "Handle já existe")
- Testes de ponta a ponta (sem Cairo mock, com Lean)

**Cairo (20h)**
- Integração com action do Next.js (Marina chama Cairo)
- Zod validation erro handling

**Letícia (35h)**
- Tela de vincular creator a squad (inline, no editor de opp)
- Visual feedback (loading, success, error states)
- E2E teste (pode clicar? Vê confirmação?)
- Responsivo (mobile + desktop)

**Outcome:** Lean complete + IA integrated. Tudo verde no staging.

---

### **SEMANA 4: Dashboard + Heatmap**

**Marina (20h)**
- Queries agregadas: count opp por assessor, count claims, count provas
- API endpoint `/api/dashboard/assessor` (RLS protected)

**Letícia (30h)**
- Dashboard page: 3 cards (opps, vinculados, provas)
- Heatmap component (visualiza prova timeline)
- Ambos em staging

**Cairo (10h)**
- Validar dados calculados (confiança, timestamp)

**Outros:** Code review, integração

**Outcome:** Dashboard + heatmap renderizando em staging.

---

### **SEMANA 5: Quality Assurance + Bug Fixes**

**Todos (50h)**
- E2E manual: assessor abre opp → vincula creator → creator reivindica → vê dashboard/heatmap
- Cross-browser (Chrome, Firefox, Safari)
- Mobile responsivo
- Bug fixes

**Rodrigo (10h)**
- RLS production audit (deny-by-default checklist)
- Migration reversibilidade test

**Outcome:** Tudo verde em staging. Pronto para production.

---

### **SEMANA 6: Deploy + Monitoring**

**Rodrigo (10h)**
- Apply migration em produção Supabase
- Monitor RLS policies live

**Letícia (5h)**
- Monitor Vercel deploy

**Todos (10h)**
- Smoke tests em produção (assessor login → opp creation → publish)

**Outcome:** 🟢 Green em production.

---

## Parte 9: Esforço Total & Alocação

| Especialista | Semana 1 | Semana 2 | Semana 3 | Semana 4 | Semana 5 | Semana 6 | **Total** |
|--------------|---------|---------|---------|---------|---------|---------|---------|
| **Beatriz** | 40h | 5h | 0h | 0h | 5h | 0h | **50h** |
| **Rodrigo** | 35h | 30h | 15h | 0h | 10h | 10h | **100h** |
| **Marina** | 30h | 40h | 25h | 20h | 10h | 0h | **125h** |
| **Letícia** | 20h | 20h | 35h | 30h | 25h | 5h | **135h** |
| **Cairo** | 5h | 35h | 20h | 10h | 10h | 0h | **80h** |
| **Total** | 130h | 130h | 95h | 60h | 60h | 15h | **490h** |

**Observação:** 490h ≈ 12 semanas de um dev solo (à 40h/semana). Com 5 paralelo, é 6 semanas real (permitindo overlaps, síncronos de 1-2h/semana, reviews assíncronos).

---

## Parte 10: Próximos Passos (Após Aprovação)

1. ✅ **Este documento aprovado** → cria GitHub Issues por semana
2. 🔄 **Segunda-feira (hoje):** Kick-off — apresenta plano, responde dúvidas
3. 📋 **Até terça:** Cria ADR-001 (squad structure), ADR-002 (naming), ADR-003 (sequence)
4. 🔄 **Loop automation:** `/loop` ou `send_later` para reminders (seg 10am, wed 4pm, fri 4pm)
5. 🎯 **Semana 1:** Inicia Beatriz + Rodrigo + Marina + Letícia; Cairo observa

---

## Resumo: Os 5 Finalistas

| # | Nome | Custo | Por Quê | Combina Com |
|---|------|-------|--------|-------------|
| 1 | Tradicional | 6w | Valida tudo | Base |
| 2 | Lean | 3w | Rápido, core | Base |
| 4 | IA-First | 5w | Paralelo, acelera | Beatriz+S2 |
| 9 | Dashboard | +1.5w | Retenção | Qualquer |
| 15 | Heatmap | +0.5w | Visual diferencial | Letícia |

**Sequência:** Lean (3w) → IA-First paralelo (2w) → Dashboard+Heatmap (1.5w) → QA (2w) = **7 semanas totais**.

---

**Versão:** 1.0 (2026-07-22)  
**Status:** Pronto para execução  
**Aprovação Pendente:** Fundador (Gabriel)
