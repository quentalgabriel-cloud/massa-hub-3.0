# CLAUDE.md — FeelWorks Engineering Handbook

> Este arquivo explica como o handbook é mantido, estruturado e evoluído.

---

## 1. Propósito e Escopo

O FeelWorks Engineering Handbook é a **constituição viva** da empresa. Não é documentação técnica secundária — é o reference frame para toda decisão de produto, design, engenharia e operação.

Equivalentes de inspiração:
- AWS Well-Architected Framework
- Google Material Design
- Shopify Polaris
- Stripe Engineering Handbook
- Linear Handbook

## 2. Estrutura

```
handbook/
├── README.md                  # Índice e navegação
├── .claude/CLAUDE.md          # Este arquivo
├── docs/
│   ├── 00_FOUNDATION/         # Mental models, princípios
│   ├── 01_BRAND/              # Visual language
│   ├── 02_PRODUCT/            # Architecture
│   ├── 03_DESIGN_SYSTEM/      # Tokens, components
│   ├── 04_UX/                 # Psychology, laws
│   ├── 05_ENGINEERING/        # Architecture, testing
│   ├── 06_AI_ENGINEERING/     # Loop, context, agents
│   ├── 07_AGENTS/             # Collaboration protocol
│   ├── 08_DATA/               # Data modeling
│   ├── 09_SECURITY/           # Security, privacy
│   ├── 10_PLAYBOOKS/          # Como fizemos X
│   ├── 11_DECISIONS/          # ADRs, log de decisões
│   └── 12_TEMPLATES/          # Templates reutilizáveis
├── _reference/                # Código, imagens, exemplos
└── _utils/                    # Scripts de manutenção
```

## 3. Padrão de Documento

Cada documento deve ter:

```markdown
# [Título]

## Propósito
[Por que este documento existe?]

## Audiência
[Para quem?]

## [Conteúdo principal]

## Exemplos
[Exemplos concretos, não abstrações]

## Anti-padrões
[O que NÃO fazer]

## Ligações Cruzadas
[Remete a outros docs]

---

_Última revisão: DATA | Contribuidores: NOMES_
```

## 4. Ton e Linguagem

- **Claro**: sem jargão desnecessário
- **Direito**: sem suavizações
- **Exemplar**: sempre com exemplos reais
- **Mentoring**: como um diretor falando com o time
- **PT-BR**: linguagem brasileira natural

## 5. Processo de Atualização

### Quando Algo Muda

1. **Identificar**: O handbook está desatualizado?
2. **Issue**: Abra issue descrevendo a mudança
3. **Branch**: `handbook-update-[tema]`
4. **Edit**: Atualize o documento
5. **Decision Record**: Se for mudança importante, adicione em `11_DECISIONS/`
6. **PR**: Envie para review
7. **Merge**: Após aprovação

### Frequência

- **Semanal**: Review de atualidade
- **Mensal**: Release nova versão
- **Contínuo**: Pequenas correções

## 6. Integração com Claude Code

O handbook é lido automaticamente por Claude Code:

1. Ao abrir este repo, Claude Code lê `/handbook/README.md`
2. Depois lê `00_FOUNDATION/` (especialmente MentalModels)
3. Durante uma tarefa, cruza decisões com `Principles.md`
4. Depois consulta seção relevante

**LivingContext:** (Fase 5+)
- O handbook define EXATAMENTE como Claude Code lê/memoriza contexto
- Session-end.sh atualiza handbook com insights
- Handbook evolui com cada sessão

## 7. Critérios de Qualidade

### Cada Seção Deve Ter

- ✅ Objetivo claro
- ✅ Audiência explícita
- ✅ Índice/estrutura
- ✅ Exemplos concretos
- ✅ Anti-padrões
- ✅ Ligações cruzadas
- ✅ Data de revisão
- ✅ Contribuidores

### Medições

- **Completude**: Todas as seções têm documentos?
- **Frescor**: Última revisão foi há quanto tempo?
- **Coerência**: Há contradições entre docs?
- **Exemplos**: Cada doc tem pelo menos 2 exemplos?

## 8. Quando Conflitar com o Código

O handbook é sempre a fonte da verdade.

Se o código divergir do handbook:
1. O handbook tem razão
2. O código precisa ser atualizado
3. OU o handbook está desatualizado e precisa de revisão

Nunca ignore o handbook. Se achar que está errado, abra issue e discuta.

## 9. Versionamento

- **v1.0**: Fase 1-4 (Foundation + Brand + Product + UX) completas
- **v1.1+**: Atualizações incrementais
- **v2.0**: Quando há revisão completa de princípios

---

_Última consolidação: junho/2026. Este documento prevalece sobre conversas de IA anterior._
