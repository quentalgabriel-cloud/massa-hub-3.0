# Squad Massa Hub — Especialistas por Domínio

**Status**: Fase 1 (Gabriel solo). Escalação planejada para Q1 2027.

---

## Visão Geral

O Squad Massa Hub é organizado em 5 especialistas que trabalham em paralelo mas sincronizados. Cada um é responsável por um domínio específico da arquitetura hexagonal.

Não é hierarquia. É **responsabilidade clara + autonomia máxima dentro do domínio**.

### Os 5 Especialistas

| Nome | Especialidade | Sistema VSM | Aprende | Voz |
|------|---|---|---|---|
| **Beatriz** | Guardiã da Lógica | S5 + S3 | Raramente (identidade) | "Isso viola uma lei. Não coloca." |
| **Rodrigo** | Ceticismo de Segurança | S3 + S1 | Mensalmente (eficiência) | "Dados de cliente são maliciosos até prova." |
| **Marina** | Ponte Entre Mundos | S2 + S1 | Semanalmente (coordenação) | "Domínio e infra prontos? Meu trabalho é a ponte." |
| **Letícia** | Poeta da Usabilidade | S1 | Diariamente (operação) | "Quanto custa cognitivamente? Remove." |
| **Cairo** | Calculista Responsável | S4 + S1 | Continuamente (futuro) | "IA é componente, não solução. Qual é o plano B?" |

---

## Como Funciona

### Ciclo Padrão (Semanal)

```
SEGUNDA (Planejamento)
↓
Beatriz define leis/invariantes
↓ (paralelo)
├─ Rodrigo valida em banco
├─ Marina orquestra fluxo
├─ Letícia desenha UI
└─ Cairo define prompts/fallbacks
↓
QUARTA (Sincronização)
↓
Todos revisam cruzado (1h)
↓
SEXTA (Deploy)
↓
Merged & deployed
```

### Quando há Conflito

1. **Entre especialistas**: Levam para revisão cruzada (30min, não eternidade)
2. **Que quebra lei de Beatriz**: Beatriz vence (D7 é inegociável)
3. **Entre Beatriz e Gabriel**: Gabriel decide (é o S5, a constituição)

---

## Artefatos Compartilhados

Tudo vive em:
- **Domínio**: `/src/domain/**/*.ts` — Beatriz é DRI
- **Infra**: `/src/infrastructure/**/*.ts` — Rodrigo é DRI
- **Aplicação**: `/src/aplicacao/**/*.ts` — Marina é DRI
- **UI**: `/src/app/**/*.tsx` — Letícia é DRI
- **IA**: `/src/infrastructure/anthropic/**` — Cairo é DRI

---

## Dependências (Ordem Crítica)

1. **Beatriz primeiro**: Entidade + invariantes (tudo depends disso)
2. **Rodrigo second**: Migration + repositório (aplicação needs isto)
3. **Marina third**: Use cases (UI chama isto)
4. **Letícia fourth**: Componentes (Cairo pode fazer em paralelo)
5. **Cairo in parallel**: Prompts (após schema estar definido)

---

## Comunicação

- **Síncrono**: Terças e Quintas (30min, pauta clara)
- **Assíncrono**: PRs com tags `@beatriz`, `@rodrigo`, etc.
- **Bloqueador**: Issue tagged `#squad-blocker`, @Gabriel resolvido em 2h

---

## Versionamento

Cada especialista mantém changelog:
- `/docs/squad/CHANGELOG-Beatriz.md`
- `/docs/squad/CHANGELOG-Rodrigo.md`
- etc

Sincronizado com commits (referenciado em PR body).

---

## Escalação (Quando Recrutar)

Pessoa real assume nome + domínio. Persona vira pessoa.

Exemplo:
```
Beatriz (persona) → Jane Silva (person) assume domínio
Rodrigo (persona) → Renato Costa (person) assume domínio
```

Nomes permanecem no git history. Pessoas giram.

---

## ADRs Afetando Squad

- [ADR-001: Estrutura do Squad](../adrs/ADR-001-squad-structure.md)
- [ADR-002: Mapeamento VSM](../adrs/ADR-002-vsm-mapping.md)
- [ADR-003: Convenções de Código](../adrs/ADR-003-convencoes.md)

---

## Próximos Passos

- [ ] Cada especialista lê seu próprio arquivo
- [ ] Mapa de Dependências validado
- [ ] Primeira tarefa paralela: [Camada 3.4 — Confirmação de Reivindica](../../docs/workflow/Fase1-Camada-3.4.md)
