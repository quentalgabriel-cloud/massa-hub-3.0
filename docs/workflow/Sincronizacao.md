# Protocolo de Sincronização — Squad Massa Hub

Como as 5 pessoas trabalham juntas sem bloqueio.

---

## Ciclo Padrão (Semanal)

```
SEGUNDA (Planejamento)
└─ 30-45min
   - Gabriel: OK para começar?
   - Beatriz: Tarefas desta semana?
   - Outros: Bloqueadores?

TERÇA (Revisão Cruzada #1)
└─ PRs abertas → comentários + aprovação

QUARTA (Sincronização Intermediária)
└─ 30-60min
   - Há conflitos?
   - Decisões que bloqueiam?
   - Próximos passos claro?

QUINTA (Revisão Cruzada #2)
└─ PRs finais → merge-ready?

SEXTA (Deploy & Restrospectiva)
└─ 15-30min
   - Merge OK?
   - Deploy OK?
   - O que aprendemos?
```

---

## Comunicação Padrão

### Síncrono (Raro, Proposital)

**Segunda + Quarta + Sexta (3h/semana máximo)**

- Google Meet 30-60min
- Pauta clara antes (GitHub issue com checklist)
- Chat durante para links/refs
- Não é brainstorm — é decisão

**Fora do horário?** Assíncrono (GitHub).

---

### Assíncrono (Padrão)

**GitHub**

Qualquer pessoa:

1. Abre PR com descrição clara
   ```markdown
   ## O Que
   Implementa Perfil.reivindicar() com invariante D7.
   
   ## Por Quê
   Reivindicação de perfil é Fase 1.
   
   ## Como
   - Entidade Perfil + método reivindicar()
   - 20 testes cobrindo D7
   - Invariante é testável sem DB
   ```

2. Tagueia especialistas relevantes
   ```
   @beatriz — aprovação de lógica
   @rodrigo — (aguardando infra)
   ```

3. Especialista revisa em 24h
   ```markdown
   ✅ Aprovado. D7 está executável.
   
   Pequeno comentário na linha 45: adicionar comentário explicando por quê "pendente exige origem".
   ```

4. Autor ajusta (se necessário)

5. Merge quando tiver aprovação

---

### Bloqueador

Se alguém bloqueia, registra em Issue com tag `#squad-blocker`:

```markdown
## Bloqueador: D7 Violada em Rodrigo

Marina quer salvar Perfil pendente sem origem.
Beatriz diz que viola D7.

Gabriel: pode resolver?

Ref: PR #XYZ
```

**SLA**: Gabriel responde em 24h (máximo).

---

## Padrão de PR por Especialista

### Beatriz (Domínio)

```markdown
## Domínio: [Entidade]

### O Que
- [ ] Entidade criada: `X.ts`
- [ ] Invariantes: [lista]
- [ ] Testes: [N+]

### Checklist Beatriz
- [ ] Entidade é imutável?
- [ ] Invariantes são executáveis?
- [ ] Testes cobrem happy path + edge cases?
- [ ] Sem referência a infra/IA/UI?

### Referências
- [D7 — Definição](../CLAUDE.md#d7)
- Lei: "Perfil pendente exige origem"
```

---

### Rodrigo (Infraestrutura)

```markdown
## Infra: [Migration + Adapter]

### O Que
- [ ] Migration: `supabase/migrations/20260722000002_*.sql`
- [ ] Adapter: `PerfilRepositorioSupabase.ts`
- [ ] RLS: [descrever]

### Checklist Rodrigo
- [ ] Migration é idempotente (roda 2x OK)?
- [ ] RLS é deny-by-default?
- [ ] Zod valida entrada?
- [ ] Testes sem Supabase real?

### Dependências
- Requer: Beatriz PR #XYZ (entidade)
- Depende de: [aplicação depois]

### Referências
- [RLS Pattern](./Convencoes.md#rls)
```

---

### Marina (Aplicação)

```markdown
## Aplicação: [Use Case]

### O Que
- [ ] Caso de uso: `ReivindicarPerfil.ts`
- [ ] DTO: validado com Zod
- [ ] Erros: nomeados + específicos

### Checklist Marina
- [ ] Input validado?
- [ ] Output é tipo forte?
- [ ] Lógica está em Beatriz (domínio)?
- [ ] Testes rodam sem banco?

### Dependências
- Requer: Beatriz #XYZ + Rodrigo #ABC
- Usada por: Letícia próxima

### Referências
- [Use Case Pattern](./Convencoes.md#use-case)
```

---

### Letícia (Produto)

```markdown
## Produto: [Tela + Componentes]

### O Que
- [ ] Tela: `page.tsx`
- [ ] Componente: `Botao*.tsx`
- [ ] Estados: loading, error, success

### Checklist Letícia
- [ ] Usuário entende sem manual?
- [ ] Estados visíveis?
- [ ] Componentes reutilizáveis?
- [ ] Props tipadas?

### Dependências
- Requer: Marina #DEF (caso de uso)
- Sincroniza com: Cairo (se houver IA)

### Referências
- [Progressive Disclosure](./Convencoes.md#progressive-disclosure)
```

---

### Cairo (IA)

```markdown
## IA: [Prompt + Schema]

### O Que
- [ ] Prompt: `src/infrastructure/anthropic/prompts/*.md`
- [ ] Schema: Zod validando
- [ ] Fallback: definido

### Checklist Cairo
- [ ] Prompt em Git (não em código)?
- [ ] Schema Zod valida?
- [ ] Fallback testado?
- [ ] Custo de tokens OK?

### Dependências
- Requer: Especificação de schema
- Usada por: Marina/Letícia (async)

### Referências
- [Prompt Pattern](./Convencoes.md#prompt)
```

---

## Revisão Cruzada (Quarta)

Meeting de 30-60min.

**Pauta**:

1. **PRs em Review** (10min)
   - Alguém tem bloqueador? Resolve aqui.
   - Aprovações OK?

2. **Próximos Passos** (10min)
   - Semana que vem: o quê?
   - Há dependências novas?

3. **Aprendizados** (5min)
   - Algo que não funcionou?
   - Padrão que melhorou?

4. **Gabriel** (se houver bloqueador) (5min)
   - Decision time

---

## Exemplo: Fluxo Real

### Quarta-feira, 10am

```
Beatriz publica PR #42: "Domínio: Perfil.reivindicar()"
├─ 20 testes ✅
└─ D7 é testável ✅

Rodrigo vê PR, comentário:
"Pronto para fazer infra quando merge. Posso começar?"

Gabriel aprova (S5, constituição está OK).

Beatriz: "Merge!"

Rodrigo começa infra (segunda-feira de manhã já).
Marina lê Beatriz code (paralelo, não bloqueada).
```

### Sexta-feira, 10am

```
Rodrigo publica PR #43: "Infra: PerfilRepositorio + migration"
├─ Migration idempotente ✅
└─ RLS testada ✅

Marina publica PR #44: "Aplicação: ReivindicarPerfil"
├─ Caso de uso orquestra Beatriz + Rodrigo ✅
└─ Testes sem banco ✅

Beatriz & Rodrigo revisam PRs um do outro (cruzado).

Ambas aprovam.

Gabriel: "OK para merge."

Merge e deploy segunda.
```

---

## SLAs de Review

| PR Size | Reviewer | SLA |
|---------|----------|-----|
| < 100 linhas | Especialista | 24h |
| 100-300 linhas | 2 especialistas | 48h |
| > 300 linhas | 3 especialistas + Gabriel | 72h |

**Fora do SLA?** → Ping no PR (ameaço publicamente, é social)

---

## Prioridades de Revisão

1. **Red flags** (bloqueadores) — 1h
2. **Green flags** (pronto) — 24h (merge ASAP)
3. **Yellow flags** (precisa ajuste) — 48h

---

## Próximos Passos

- [ ] Leia Sincronizacao.md (você está aqui)
- [ ] Leia Convencoes.md (padrões de código)
- [ ] Primeira reunião segunda: 10am
- [ ] Pauta: Semana 1 com Beatriz
