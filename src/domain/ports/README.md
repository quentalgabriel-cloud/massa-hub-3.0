# ports — os contratos do domínio

Interfaces que o domínio **define** e a infraestrutura **implementa** (ports & adapters).

- `OportunidadeRepositorio.ts`, `ProvaRepositorio.ts` — portas de persistência
- `ExtratorDeTicket.ts` — porta de saída para IA (o domínio não conhece a Anthropic)

A direção da dependência aponta para cá: a infra depende do domínio, nunca o contrário.
