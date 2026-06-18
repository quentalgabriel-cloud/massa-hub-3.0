# domain — o núcleo do negócio

Regras, entidades e value objects da Massa Hub. **Não conhece banco, rede, Next, Supabase nem Anthropic.**

- `oportunidade/` — Oportunidade, Squad, Papel (módulo Fase 1)
- `prova/` — Prova, Assinatura, Lastro (reputação = lastro, nunca score)
- `ports/` — interfaces (contratos) que a infraestrutura implementa

**Regra dura:** nada aqui importa de `infrastructure/`. Testável sem banco. Ver AGENTS.md §2.
