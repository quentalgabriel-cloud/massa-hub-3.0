# Deploy & Produção — Massa Hub

Estado operacional do Fase 1. Fonte de verdade viva (retomável entre sessões).

---

## Estado atual (2026-07-23)

- **Código**: Fase 1 completo (oportunidades + IA extração, prova/Lastro, claim
  profile, nó do assessor, `/handle` público). 101 testes verdes, `tsc` limpo.
- **Banco Supabase** (`massa-hub-3.0` / `bmwlxjtuhwrqvacnvnhc`, sa-east-1):
  **schema 100% aplicado**. Tabelas `perfis`, `oportunidades`, `provas`,
  `assinaturas` — todas com RLS **deny-by-default** (acesso só server-side via
  service role). 0 linhas. O **remoto é a fonte de verdade** do schema; os
  arquivos em `supabase/migrations/` são registro histórico e podem divergir
  levemente (reconciliar só se/quando adotar migrations via CLI).
- **PR #9**: aberto, CI (Vercel preview) verde. **Ainda não mergeado** — ver gate abaixo.

---

## Variáveis de ambiente (Vercel) — pré-requisito para produção funcionar

Quatro. As duas **secretas** são o que falta:

| Var | Tipo | Gate | Onde obter |
|-----|------|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | pública | auth + adapters | painel Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | pública | auth (login/middleware) | idem |
| `SUPABASE_SERVICE_ROLE_KEY` | **secreta** | todo acesso a banco server-side | Supabase → API → `service_role` |
| `ANTHROPIC_API_KEY` | **secreta** | extração de ticket por IA (feature-âncora) | console.anthropic.com |

Sem `SUPABASE_SERVICE_ROLE_KEY`, o adapter (`cliente.ts`) lança em runtime — todas
as páginas que tocam banco quebram. Sem `ANTHROPIC_API_KEY`, o coração do módulo
(colar briefing → ticket) quebra. As públicas são provavelmente já setadas (o
login funciona no preview).

**Setar em:** Vercel → projeto massa-hub-3-0 → Settings → Environment Variables
(Production + Preview). São segredos — nunca commitados.

---

## Gate de merge para `main` (= deploy de produção)

Merge do PR #9 dispara deploy de produção. **Não mergear antes de o fluxo estar
verificado**, senão produção sobe quebrada. Sequência correta:

1. Setar as 2 secrets no Vercel (acima).
2. Verificar o fluxo no **preview** (checklist abaixo).
3. Só então mergear PR #9 → `main`.

---

## Checklist de verificação (≈5 min, no preview)

1. Login com Google → entra.
2. `/oportunidades/nova` → colar um briefing bruto → **extrair** (testa
   `ANTHROPIC_API_KEY`) → publicar (testa `SUPABASE_SERVICE_ROLE_KEY` + provisiona
   o Perfil do assessor).
3. Na Screen 10, **vincular** um creator (nome + handle) → aparece "pendente".
4. Abrir `/<handle-do-assessor>` → mostra **Atividade** (1 oportunidade, 1 marca).
5. Abrir `/<handle-do-creator>` → mostra estado "não reivindicado".
6. Reivindicar via `/reivindicar/<perfilId>` logado → vira "reivindicado".

Se os 6 passarem, Fase 1 está provado ponta a ponta → mergear.

---

## Limitações conhecidas (registradas, não bloqueantes)

- **Race em provisão do assessor**: duplo-submit concorrente de um usuário novo
  pode errar no 2º request (`UNIQUE(usuario_id)`); retry resolve. Fix só se
  concorrência virar real.
- **Namespace `perfilId` em candidatar/prova**: reconciliado para o assessor
  (Onda 2). Falta para a auto-candidatura do creator e as ações de prova — fica
  para a onda que habilitar "ver candidatos" (spec 03). Não é regressão.
- **`/handle` de perfil pendente é público** (com badge "não reivindicado"):
  decisão de produto — mostra só fatos ancorados. Inverter para 404 é 1 linha se
  preferir mais conservador em privacidade.
