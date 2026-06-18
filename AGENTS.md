# AGENTS.md — Convenções Técnicas para Subagentes

> Este arquivo é o harness técnico do projeto. Leia SEMPRE junto com o CLAUDE.md
> (estratégia/produto). Este arquivo cobre: estrutura de código, convenções, sequência
> de trabalho, o que cada tipo de agente pode tocar, e como o paralelismo é seguro.
>
> Referência de stack: Next.js 15 App Router + TypeScript + Supabase + Vercel.
> Arquitetura: hexagonal (ports & adapters). Modelar domínio PRIMEIRO, Supabase DEPOIS.

---

## 1. Estrutura de pastas esperada

```
src/
  domain/                     # Núcleo do negócio — SEM dependências externas
    oportunidade/
      Oportunidade.ts          # Entidade (tipos, regras, validações puras)
      Papel.ts                 # Value Object
      Squad.ts                 # Value Object (lista de Papéis)
    prova/
      Prova.ts                 # Entidade
      Lastro.ts                # Value Object (agregado contável, nunca score)
    ports/                     # Interfaces (contratos) — definidas no domínio
      OportunidadeRepositorio.ts
      ProvaRepositorio.ts
      ExtratorDeTicket.ts      # Porta de saída para IA (não conhece Anthropic)

  application/                 # Casos de uso — orquestra domínio, usa portas
    CriarOportunidade.ts
    ExtrairTicket.ts
    PublicarOportunidade.ts

  infrastructure/              # Adapters — implementações das portas
    supabase/
      OportunidadeRepositorioSupabase.ts
      ProvaRepositorioSupabase.ts
    anthropic/
      ExtratorDeTicketAnthropic.ts
    supabase/
      cliente.ts               # Factories (createServerClient / createBrowserClient)

  app/                         # Next.js App Router
    (publico)/
      [handle]/                # Páginas públicas /handle
    (autenticado)/
      oportunidades/           # Módulo de oportunidades (Fase 1)
        page.tsx               # Server Component
        nova/
          page.tsx             # Screen 10: publicar oportunidade
    api/
      ticket/
        route.ts               # Edge function: extração de ticket via IA

  components/
    ui/                        # Componentes atômicos (sem lógica de negócio)
    oportunidades/             # Componentes do módulo de oportunidades

  hooks/                       # React hooks (Client Component logic)

eval/
  ticket/                      # Fixtures: briefing real → ticket esperado
    fixtures/
    run.ts                     # Script de avaliação rodável

docs/
  sessoes/                     # Memória de sessão (gerada pelo hook SessionEnd)
  specs/                       # Contratos de domínio (fonte da verdade)
  decisoes/                    # Log de decisões (não reabrir sem motivo)
```

---

## 2. Regra dura de imports (não negociável)

```
domain/    → NUNCA importa de infrastructure/, app/, components/
             PODE importar outros módulos de domain/

application/ → importa domain/ (entidades + portas)
               NUNCA importa infrastructure/ diretamente
               Recebe adapters via injeção

infrastructure/ → implementa portas definidas em domain/ports/
                  importa clients externos (supabase, anthropic)
                  NUNCA contém regra de negócio

app/         → importa application/ (casos de uso) e components/
               NUNCA importa infrastructure/ diretamente
               Server Actions: usam casos de uso, não repositórios diretos
```

Se um import cruza essa fronteira, é um bug de arquitetura — reverter antes de mergear.

---

## 3. Convenções de nomenclatura

| Contexto | Convenção | Exemplo |
|----------|-----------|---------|
| Entidades e VOs (domínio) | PascalCase, PT-BR | `Oportunidade`, `Lastro`, `Squad` |
| Portas (interfaces) | PascalCase + sufixo do papel | `OportunidadeRepositorio`, `ExtratorDeTicket` |
| Adapters | PascalCase + sufixo do provider | `OportunidadeRepositorioSupabase` |
| Casos de uso | PascalCase, verbo no infinitivo | `CriarOportunidade`, `ExtrairTicket` |
| Arquivos TypeScript | PascalCase para classes/entidades, camelCase para utils | `Oportunidade.ts`, `formatarData.ts` |
| Componentes React | PascalCase | `CardOportunidade.tsx` |
| Rotas Next.js | kebab-case | `oportunidades/nova/page.tsx` |
| Variáveis/funções | camelCase | `criarOportunidade`, `ticketEstruturado` |
| Constantes | SCREAMING_SNAKE_CASE | `STATUS_OPORTUNIDADE` |
| Commits | feat/fix/refactor/docs/test + PT-BR | `feat(oportunidade): adicionar validação de squad` |

---

## 4. Sequência obrigatória de trabalho por módulo

Nenhum agente pula etapas. A ordem existe por razão arquitetural.

```
1. DOMÍNIO PRIMEIRO
   - Escrever entidades e VOs em domain/
   - Escrever as portas (interfaces) em domain/ports/
   - Escrever testes unitários do domínio (sem banco, sem rede)
   - ✅ Critério: testes passam, zero imports de infrastructure/

2. CASOS DE USO
   - Escrever em application/ usando domínio + portas
   - Escrever testes com mocks das portas (não do banco)
   - ✅ Critério: testes passam sem Supabase rodando

3. ADAPTERS (podem ser paralelos entre si, nunca com o domínio)
   - infrastructure/supabase/ — implementa portas de repositório
   - infrastructure/anthropic/ — implementa porta ExtratorDeTicket
   - ✅ Adapters independentes podem ser desenvolvidos em worktrees simultâneos

4. INTEGRAÇÃO
   - Conectar adapters nos casos de uso (injeção)
   - Testes de integração (com Supabase local ou mock http)

5. UI (Next.js)
   - Server Components chamam casos de uso
   - Client Components apenas para interatividade
   - Server Actions para mutações

6. EVALS (módulo de IA apenas)
   - Rodar /eval/ticket/ contra o adapter Anthropic
   - Ajustar system prompt até evals passarem
   - UI da Screen 10 só vai para produção após evals
```

---

## 5. Regras de código (TypeScript + Next.js)

Baseado no `examples/saas-nextjs-CLAUDE.md` do ECC, adaptado para o Massa Hub:

```typescript
// ✅ Tipo de resposta padrão para Server Actions e API routes
type Resultado<T> =
  | { ok: true; dados: T }
  | { ok: false; erro: string; codigo?: string }

// ✅ Server Action pattern
'use server'
import { z } from 'zod'
const schema = z.object({ ... })
export async function acao(formData: FormData): Promise<Resultado<...>> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { ok: false, erro: 'Dados inválidos' }
  // ... chamar caso de uso, não repositório direto
}

// ✅ Supabase: sempre com RLS, nunca select('*')
const { data } = await supabase
  .from('oportunidades')
  .select('id, marca, status, criado_em')
  .eq('autor_id', user.id)
  .limit(50)

// ❌ Nunca
supabase.from('oportunidades').select('*')          // sem limite
import { supabaseAdmin } from '@/infra/supabase'    // no componente
const { data: { session } } = await supabase.auth.getSession()  // usar getUser()
```

**Outras regras:**
- Sem emojis em código ou comentários
- Padrões imutáveis (spread operator, nunca mutar)
- Server Components por padrão; `'use client'` só quando necessário
- Zod para toda validação de input (rotas, forms, env vars)
- `font-size: 16px` em textareas (evita zoom iOS)
- Alvos de toque ≥ 44px
- Todos os queries com `.limit()` — nunca unbounded

---

## 6. Paralelismo seguro vs. não seguro

```
✅ SEGURO (genuinamente independente):
   - Exploração / pesquisa / leitura (só leitura)
   - Adapter Supabase // Adapter Anthropic (portas diferentes)
   - Componente UI // Server Action (camadas diferentes)
   - Code review // Testes adicionais

❌ NÃO SEGURO (existe dependência de ordem):
   - Domínio // Adapter (adapter depende do contrato do domínio)
   - Porta // Caso de uso (caso de uso usa a porta)
   - Caso de uso // Server Action (action chama o caso de uso)
```

Usar `git worktree` para branches paralelas quando paralelismo for seguro:
```bash
git worktree add ../massa-adapter-supabase -b feat/adapter-supabase
git worktree add ../massa-adapter-anthropic -b feat/adapter-anthropic
# trabalho paralelo possível aqui, merge depois
```

---

## 7. Checklist pré-merge (code review em 2 camadas)

**Camada 1 — conformidade com spec:**
- [ ] Campos do ticket correspondem ao contrato em `/docs/specs/02-modulo-oportunidades.md`
- [ ] Prova tem ≥2 assinaturas para status `verificada` (spec 01)
- [ ] Nenhum score numérico introduzido (D1, proibido)
- [ ] Squad usa `{ funcao, qtd }` (não vaga única genérica)
- [ ] Heatmap (Ritmo) só renderiza com dados reais (spec 01)

**Camada 2 — qualidade hexagonal:**
- [ ] Nenhum import de `infrastructure/` ou `supabase` em `domain/`
- [ ] Nenhum import de `infrastructure/` direto em `app/` (usar casos de uso)
- [ ] Testes de domínio não dependem de banco rodando
- [ ] Todos os queries Supabase têm `.limit()` e colunas explícitas
- [ ] Server Actions validam input com Zod antes de qualquer operação

---

## 8. Design system (tokens mínimos para agentes de UI)

```css
--paper:      #FAFAF6;
--card:       #FFFFFF;
--ink:        #16151D;
--ink2:       #5C5A66;
--line:       #E8E6DD;
--violet:     #6C5BFF;   /* marca */
--violet-deep:#2B1FA8;
--violet-soft:#EFEDFF;
--ember:      #FF5A2D;   /* uso parcimonioso */
--ok:         #117A53;
```

Tipografia:
- **Archivo 700-900** — títulos e display
- **Inter** — corpo de texto
- **IBM Plex Mono** — handles, números, labels de dados, badges

Raio: 8-12px. Sem sombras. Bordas 1px em `--line`.

---

## 9. Variáveis de ambiente

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # server-only, NUNCA expor ao client

# Anthropic (adapter de extração de ticket)
ANTHROPIC_API_KEY=             # server-only

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. Repomix — contexto comprimido para agentes

Quando um agente precisar de contexto do codebase sem explorar arquivo por arquivo:

```bash
# Contexto completo comprimido (src/ inteiro)
npx repomix --compress --style xml \
  --ignore "node_modules,.next,watch-*,.claude/skills" \
  -o /tmp/massa-context.xml

# Só o domínio (para agente de entidades)
npx repomix --compress --include "src/domain/**" -o /tmp/domain-context.xml

# Só specs (para agente de revisão de contrato)
npx repomix --compress --include "docs/specs/**" -o /tmp/specs-context.xml

# Com limite de tokens (falha se exceder — útil para garantir fit)
npx repomix --compress --token-budget 150000 -o /tmp/massa-context.xml
```
