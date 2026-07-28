# Mapa de Dependências — Squad Massa Hub

Quem depende de quem. Ordem crítica para paralelismo sincronizado.

---

## Grafo de Dependências (Fase 1)

```
BEATRIZ (Domínio)
├─ Ninguém depende dela primeiro (ela é fundação)
├─ → RODRIGO depende (implementar DB baseado em entidade)
├─ → MARINA depende (orquestrar com entidade)
├─ → LETÍCIA depende (UI reflete modelo)
└─ → CAIRO depende (schemas validam saída de IA)

RODRIGO (Infraestrutura)
├─ Depende de: BEATRIZ (entidade → migration)
├─ → MARINA depende (caso de uso chama repositório)
├─ → LETÍCIA depende (indiretamente, via Marina)
└─ → GABRIEL (validar migration em Supabase)

MARINA (Aplicação)
├─ Depende de: BEATRIZ + RODRIGO
├─ → LETÍCIA depende (tela chama caso de uso)
├─ → CAIRO depende (indiretamente, se caso de uso usa IA)
└─ Sincroniza com GABRIEL (decisões de negócio)

LETÍCIA (Produto)
├─ Depende de: MARINA (caso de uso pronto)
├─ Sincroniza com CAIRO (se tela precisa de IA)
└─ Reviewe de GABRIEL (padrão de UI)

CAIRO (IA)
├─ Depende de: Ninguém obrigatoriamente
├─ Sincroniza com: Quem quer IA (Marina, Letícia, etc)
└─ Reporta custo de tokens para GABRIEL
```

---

## Ordem de Implementação (Fase 1)

### SEMANA 1 — Fundação

**BEATRIZ AQUI SOZINHA**

```
SEG: Lê spec (Reivindicação de Perfil)
TER: Escreve entidade + invariantes
QUA: Escreve testes (20+)
QUI: Code review consigo mesmo
SEX: Publica PR "Domínio: Perfil.reivindicar()"
```

**Saída esperada**: Entidade pronta, testes passando.

**Outros**: Waiting (podem estudar, mas não codificam ainda).

---

### SEMANA 2 — Infraestrutura + Orquestração

**RODRIGO + MARINA EM PARALELO**

```
SEG: Rodrigo lê entidade de Beatriz
     Marina lê entidade de Beatriz

TER-QUA:
     Rodrigo escreve migration + adapter
     Marina escreve caso de uso

QUI: Sincronização (1h)
     - Rodrigo mostra repositório → Marina valida contrato
     - Resolvem qualquer brechas

SEX: Ambos publicam PRs
     - Rodrigo: "Infra: PerfilRepositorio + migration"
     - Marina: "Aplicação: ReivindicarPerfil case"
```

**Saída esperada**: Infra pronta, caso de uso pronto.

**Letícia, Cairo**: Waiting (podem revisionar, mas não codificam ainda).

---

### SEMANA 3 — UI + IA Paralelo

**LETÍCIA + CAIRO EM PARALELO**

```
SEG: Letícia lê caso de uso de Marina
     Cairo observa se há IA necessária

TER-QUA:
     Letícia refina tela + componentes
     Cairo prepara prompts/schemas (se aplicável)

QUI: Sincronização (1h)
     - Letícia mostra UI → Todos validam fluxo
     - Cairo mostra prompts → Validam schema

SEX: Publicam PRs
     - Letícia: "Produto: Reivindicação polida"
     - Cairo: (se houver IA) "IA: [feature específica]"
```

**Saída esperada**: UI pronta, IA pronta (se houver).

---

### SEMANA 4 — Integração + Deploy

```
SEG: Sincronização completa (2h)
     - Todos revisam cruzado
     - Gabriel arbitr conflitos

TER-QUA:
     - Ajustes de PRs
     - Testes E2E

QUI: Merge para main

SEX: Deploy + monitoramento
```

---

## Pontos de Sincronização Críticos

### SEGUNDA (Planejamento)

**Participantes**: Gabriel + todos 5  
**Duração**: 30-45min  
**Agenda**:
- O que cada um vai fazer esta semana?
- Bloqueadores conhecidos?
- Mudanças de spec?

**Artefato**: Task list atualizado em GitHub Issues

---

### QUARTA (Revisão Cruzada)

**Participantes**: Beatriz + Rodrigo + Marina (obrigatório)  
            Letícia + Cairo (se houver PR em review)  
**Duração**: 30-60min  
**Agenda**:
- Rodada de PRs abertas
- Bloqueadores?
- Decisões que precisam de Gabriel?

**Artefato**: PRs aprovadas ou comentários deixados

---

### SEXTA (Status & Deploy)

**Participantes**: Gabriel + quem tem PR mergeable  
**Duração**: 15-30min  
**Agenda**:
- Merge OK?
- Deploy?
- Próxima semana: o que muda?

**Artefato**: Commits on main, status atualizado

---

## Regras de Bloqueio

Se **Beatriz** diz não:
→ Bloqueio absoluto (invariante não negocia)
→ Vai para Gabriel apenas se discordarem da definição de invariante

Se **Rodrigo** diz não (segurança):
→ Bloqueio absoluto (RLS não negocia)
→ Vai para Gabriel apenas se for trade-off business vs. segurança

Se **Marina** diz não (arquitetura):
→ Bloqueio relativo (pode haver alternativa)
→ Resolve com Beatriz + Rodrigo; se não resolver, Gabriel

Se **Letícia** diz não (UX):
→ Bloqueio relativo (pode haver tradeoff)
→ Resolve com Marina; se não resolver, Gabriel

Se **Cairo** diz não (IA confiável):
→ Bloqueio relativo (pode ir sem IA, para Phase 2)
→ Resolve com quem precisa; se não resolver, Gabriel

Se **Gabriel** diz não:
→ Bloqueio absoluto (é o S5, constituição)

---

## Escalação de Conflito

**Cenário**: Marina quer orquestração que Beatriz diz que viola D7.

**Processo**:
1. Ambos escrevem posição (GitHub comment, 5min cada)
2. Gabriel lê (não participa, só lee)
3. Gabriel decide em 24h
4. Registra decisão em ADR

---

## Código de Conduta Squad

- Recuse, **não suavize**. Melhor conflito claro agora que surpresa em deploy.
- Sempre cite a lei/padrão quando recusar ("Violates D7", "RLS deny-by-default", etc)
- PRs têm SLA de review: 24h máximo (não deixa pendendo)
- Síncrono é raro. Assíncrono é padrão (GitHub, não Slack)

---

## Próximos Passos

- [ ] Leia Dependências.md (você está aqui)
- [ ] Leia Sincronizacao.md (próximo)
- [ ] Leia Convencoes.md (padrões de código)
- [ ] Validem mapa (há erros?)
- [ ] Próxima segunda: primeira sincronização
