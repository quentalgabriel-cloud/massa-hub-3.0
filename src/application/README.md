# application — os casos de uso

Orquestra o domínio através das portas. Recebe os adapters por **injeção** — não os importa direto.

Exemplos (Fase 1): `CriarOportunidade`, `ExtrairTicket`, `PublicarOportunidade`.

Testável com mocks das portas, sem Supabase rodando. Ver AGENTS.md §4.
