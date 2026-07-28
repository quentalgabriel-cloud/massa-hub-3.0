# Loop Autopromptável — Massa Hub

Mecanismo de sincronização e reminder automático para a Fase 1. Sem ferramentas externas — baseado em GitHub Issues + CLI.

---

## Como Funciona

A cada **segunda-feira 10am, quarta-feira 4pm, sexta-feira 4pm**, o loop dispara um reminder com:
1. Checklist de status (o que saiu, o que bloqueia)
2. Próximos passos claros
3. Agenda para a sincronização

---

## Setup: Loop Local (CLI)

Use o comando `/loop` do Claude Code para ativar o loop:

```bash
/loop "Massa Hub — Fase 1: Semana [N] — Planejamento"
```

Isso re-invoca Claude Code na próxima semana com contexto fresco.

**OU**, use cron + GitHub Issues (abaixo).

---

## Setup: Loop via GitHub Issues (Manual)

Se preferir não usar `/loop`, crie Issues **por semana** com este template:

### Template: Semana [N]

```markdown
# Semana [N]: [Título da Fase] — [Intervalo de Datas]

**Status Geral:** 🟡 Em progresso

## Checklist (Abrir Planejamento)

**Beatriz:**
- [ ] Entidade pronta (versão X.Y)
- [ ] Invariantes testadas
- [ ] Bloqueadores? (list any)

**Rodrigo:**
- [ ] Migration idempotente
- [ ] RLS testada isoladamente
- [ ] Adapter implementado
- [ ] Bloqueadores?

**Marina:**
- [ ] Use case(s) integrado(s)
- [ ] Testes com repo fake
- [ ] Erro handling
- [ ] Bloqueadores?

**Letícia:**
- [ ] Tela renderiza
- [ ] Estados (idle, loading, error, success)
- [ ] Responsivo?
- [ ] Bloqueadores?

**Cairo:**
- [ ] (Se IA) Prompt versionado + schema Zod
- [ ] (Se IA) Fallback testado
- [ ] Bloqueadores?

## Sincronizações Planejadas

**Segunda [data] 10am:** Planning
**Quarta [data] 4pm:** Intermediate sync
**Sexta [data] 4pm:** Deploy + retrospective

## Próximas Prioridades

(Preenchidas após reunião de segunda)

1. [...]
2. [...]
3. [...]

## Bloqueadores

(Se houver)

- [ ] Bloqueador 1 (assignee: @gabriel, SLA: 24h)

---

**Última Atualização:** YYYY-MM-DD HH:mm UTC
**Responsável de Atualizar:** Claude (após cada sync)
```

---

## Rotina Manual (Se sem Automação)

Se sem `/loop` ou cron, siga este roteiro **manualmente**:

### **Segunda-feira 10am (30-45min)**

1. **Abra Issue da Semana [N]**
2. **Preenchas checklist acima**
3. **Reunião no Google Meet (30min):**
   - Gabriel faz round-robin: Beatriz → Rodrigo → Marina → Letícia → Cairo
   - Cada um: "Isto termina segunda? Bloqueadores?"
4. **Pós-reunião:** atualiza Issue com prioridades
5. **Commit no Branch:** adiciona `.github/ISSUES/semana-[N].md` com resumo

### **Quarta-feira 4pm (30-60min)**

1. **Abra PRs em review da semana**
2. **Reunião (30min):**
   - Rodada rápida: "Pode revisar?" / "Bloqueador?"
3. **Resolve bloqueadores:**
   - Beatriz + Rodrigo revisam mutuamente
   - Marina sobe dúvidas de arquitetura
   - Cairo fecha schema se IA necessário
4. **Atualiza Issue:** "Pronto para merge? Sim/não"

### **Sexta-feira 4pm (15-30min)**

1. **Review final de PRs**
2. **Merge para `main`** (se ok)
3. **Deploy:** `git push && vercel deploy`
4. **Retrospectiva (10min):**
   - O que funcionou?
   - O que não funcionou?
   - Lições para semana que vem?
5. **Atualiza Issue:** marque como "CONCLUÍDO" ou "PARCIAL"

---

## Automação com `/loop` (Recomendado)

Se quiser que Claude Code re-invoque automaticamente **sem ação manual**, use:

```
/loop "Prepare status report for Massa Hub Fase 1, Semana [N+1]"
```

Isto dispara a mesma análise na **próxima segunda-feira** (ou intervalo que você escolher).

**Vantagem:** Claude re-lê contexto (documentação, PRs, commits) e propõe próximos passos sem você digitar.

---

## Rastreamento de Progresso (Week-by-Week)

### Semana 1: Lean (Domínio + Infra Mínimo)

**Esperado:**
- ✅ Entidade Perfil pronta (Beatriz)
- ✅ Migration + RLS (Rodrigo)
- ✅ 2 use cases (Marina)
- ✅ Tela básica (Letícia)
- ⏳ Cairo observa (não codifica)

**Critério de Sucesso:** `npm test` verde em all layers. Tese central validada (reputação por prova, assessor é porta).

### Semana 2: IA-First + Integração

**Esperado:**
- ✅ Cairo + Beatriz sincronizados (schema Zod final)
- ✅ Marina integra Cairo schema
- ✅ Letícia polida UI
- ✅ Rodrigo testa RLS em Supabase staging

**Critério de Sucesso:** IA pronta. E2E manual funciona em staging.

### Semana 3: Dashboard + Heatmap

**Esperado:**
- ✅ Dashboard page (Marina + Letícia)
- ✅ Heatmap component (Letícia + Cairo)
- ✅ Queries de agregação (Marina)

**Critério de Sucesso:** Assessor vê KPIs em staging.

### Semana 4+: QA + Deploy

**Esperado:**
- ✅ E2E suite
- ✅ Cross-browser test
- ✅ Migration em produção
- ✅ Green deploy

**Critério de Sucesso:** 🟢 Tudo verde em produção.

---

## Checklist de Saída (Fim de Semana)

Cada sexta-feira, antes de marcar "concluído", responda:

- [ ] Todos os PRs revisados?
- [ ] `npm test` verde?
- [ ] `tsc --noEmit` verde?
- [ ] Staging ou produção atualizado?
- [ ] Documentação (README, spec) atualizada?
- [ ] Próximos passos claros para semana que vem?

---

## Status de Exemplo

```
SEMANA 1 ✅ CONCLUÍDO
├─ Beatriz: Perfil + 20 testes ✅
├─ Rodrigo: Migration + RLS ✅
├─ Marina: 2 use cases ✅
├─ Letícia: Tela básica ✅
└─ Cairo: Observação ✅

SEMANA 2 🟡 EM PROGRESSO
├─ Cairo: Schema Zod 90% ✅
├─ Beatriz: Code review ✅
├─ Rodrigo: RLS staging 80% 🔄
├─ Marina: Integração Cairo 70% 🔄
└─ Letícia: UI polish 60% 🔄

SEMANA 3 ⏳ NÃO INICIADO
├─ Marina: Dashboard queries ⏳
├─ Letícia: Heatmap component ⏳
└─ Cairo: Data validation ⏳

SEMANA 4+ ⏳ NÃO INICIADO
```

---

## Troubleshooting: "Semana não sai do planejado"

Se uma semana atrasar >50%, invoke `/freio-de-escopo` ANTES de expandir scope. Perguntas:

1. Bloqueador é real ou é escopo creep?
2. Qual especialista está sobrecarregado?
3. Precisa paralelizar diferente na próxima semana?
4. Há dependência não mapeada?

**Nunca** adicione features nessa semana. Priorize terminar o planejado.

---

## Referências

- `/docs/squad/*` — Especialistas e responsabilidades
- `/docs/workflow/Dependencias.md` — Mapa de bloqueios
- `/docs/workflow/Sincronizacao.md` — Protocolo semanal
- `/docs/FASE-1-EXEC.md` — Timeline detalhada (6-7w)

---

**Versão:** 1.0  
**Data de Criação:** 2026-07-22  
**Última Revisão:** 2026-07-22
