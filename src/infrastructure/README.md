# infrastructure — os adapters (a borda)

Implementações concretas das portas do domínio. **Aqui — e só aqui — moram Supabase e Anthropic.**

- `supabase/` — repositórios + factory de cliente
- `anthropic/` — ExtratorDeTicketAnthropic (valida a saída do modelo contra schema Zod)
- `auth/` — auth Google

Nunca contém regra de negócio. Adapters independentes podem ser construídos em paralelo (AGENTS.md §6).
