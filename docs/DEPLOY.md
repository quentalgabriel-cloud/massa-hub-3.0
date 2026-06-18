# Deploy — Massa Hub

Runbook de produção. Stack: Next.js 15 (Vercel) + Supabase (Postgres) + Anthropic.

## Visão geral

```
GitHub (repo)  ──push──►  Vercel (build + host)  ──runtime──►  Supabase (dados)
                                    │
                                    └──runtime──►  Anthropic (extração de ticket)
```

O Vercel faz build a cada push no branch de produção. O domínio não conhece
Supabase nem Anthropic — ambos entram por adapters na borda, configurados por
variáveis de ambiente.

## Pré-requisitos (uma vez)

### 1. Supabase — rodar a migration

O projeto já existe: `bmwlxjtuhwrqvacnvnhc.supabase.co` (região sa-east-1).

1. Painel Supabase → **SQL Editor** → New query
2. Cole o conteúdo de `supabase/migrations/20260618000001_oportunidades_e_provas.sql`
3. Run. Cria as tabelas `provas`, `assinaturas`, `oportunidades` + índices + RLS base.

> RLS está com política placeholder permissiva. Antes de tráfego real, trocar por
> políticas ancoradas em `auth.uid()` (ver README das migrations).

### 2. Vercel — importar o repo

1. [vercel.com](https://vercel.com) → **Add New → Project → Import** `quentalgabriel-cloud/massa-hub-3.0`
2. Framework: **Next.js** (auto-detectado). Build/output: padrão, não mexer.
3. **Production Branch:** `main` (após o merge — ver abaixo).
4. **Environment Variables** — adicionar as 4 (ou usar a integração Supabase do Vercel
   que injeta as 3 primeiras automaticamente):

   | Variável | Onde achar | Exposição |
   |----------|-----------|-----------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Painel Supabase → Project Settings → API | pública |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem | pública |
   | `SUPABASE_SERVICE_ROLE_KEY` | idem (secreta) | **secreta** |
   | `ANTHROPIC_API_KEY` | console.anthropic.com | **secreta** |

5. Deploy.

> O build NÃO precisa das env vars (já validado: `npm run build` passa sem elas).
> Elas são consumidas em runtime pelos adapters. Sem elas, as páginas
> `/oportunidades*` dão erro só ao acessar — o build sobe normal.

## Branch de produção

Todo o código está em `claude/charming-noether-yhui6p`. Para o Vercel servir
produção a partir de `main`, o código precisa ser promovido para lá (merge ou PR).

## Rotas em produção

| Rota | Render | Função |
|------|--------|--------|
| `/oportunidades` | dinâmico | mercado — lista de tickets + filtros |
| `/oportunidades/[id]` | dinâmico | detalhe + candidatura |
| `/oportunidades/nova` | estático | Screen 10 — publicar com IA |

## Verificação pós-deploy

1. Abrir `/oportunidades/nova`, colar um briefing real, "Estruturar com IA".
2. Conferir realce de origem e campos extraídos. Publicar.
3. Abrir `/oportunidades` → o ticket aparece na lista.
4. Abrir o detalhe → "Candidatar meu perfil" grava no Supabase.
