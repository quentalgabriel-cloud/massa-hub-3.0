# Convenções & Padrões — Massa Hub

Rulebook técnico para garantir coerência entre os 5 especialistas. Aplica-se em domínio, infra, aplicação, UI e IA.

---

## 1. Nomenclatura (Naming)

### Entidades de Domínio

- **PascalCase**, classe/interface. Nominativo simples (o que é):
  ```typescript
  class Perfil { }
  class Oportunidade { }
  class Prova { }
  interface PerfilRepositorio { }
  ```

### Value Objects

- **PascalCase**, com sufixo `Schema` se for Zod:
  ```typescript
  class Handle { }
  class Email { }
  class Markdown { }
  const HandleSchema = z.string().min(3);
  ```

### Casos de Uso (Application Layer)

- **PascalCase**, verbo + substantivo. Sempre classe:
  ```typescript
  class ReivindicarPerfil { }
  class VincularCreatorAoSquad { }
  class PublicarOportunidade { }
  ```

### Funções & Métodos

- **camelCase**, verbo + contexto claro:
  ```typescript
  perfil.reivindicar(usuarioId)
  repo.buscarPorHandle(handle)
  repo.listarPendentesVinculadosPor(assessorId)
  ```

### Arquivos

- **kebab-case** (com hífen), exceto para classes/padrões React:
  ```
  src/domain/perfil/Perfil.ts
  src/domain/perfil/Handle.ts
  src/domain/ports/perfil-repositorio.ts  (interface de porta)
  src/aplicacao/ReivindicarPerfil.ts
  src/infra/PerfilRepositorioSupabase.ts  (adapter)
  src/app/(autenticado)/perfil/BotaoReivindicar.tsx  (componente React)
  ```

### Variáveis Locais

- **camelCase**, substantivo + tipo inferível do contexto:
  ```typescript
  const perfil = ...
  const usuarios = [...]
  const perfilId = '...'
  const ehValido = ...
  ```

### Constantes

- **UPPER_SNAKE_CASE**, somente para verdadeiras constantes de configuração:
  ```typescript
  const MAX_HANDLE_LENGTH = 50;
  const CONFIDENCE_THRESHOLD = 0.7;
  ```

---

## 2. Tipagem TypeScript

### Regra de Ouro

**Nunca `any`. Tipo forte é obrigatório.**

### Tipos Internos (Domínio & Aplicação)

- Use tipos primitivos e interfaces explícitas. Evite `interface X { [key: string]: any }`:
  ```typescript
  // ✅ Bom
  type InputReivindicar = {
    perfilId: string;
    usuarioId: string;
  };

  // ❌ Ruim
  type InputReivindicar = Record<string, any>;
  ```

### Tipos de Erro

- Sempre classe nomeada, nunca erro genérico:
  ```typescript
  // ✅ Bom
  class ErroPerfilNaoEncontrado extends Error {
    constructor(perfilId: string) {
      super(`Perfil ${perfilId} não encontrado.`);
      this.name = 'ErroPerfilNaoEncontrado';
    }
  }

  // ❌ Ruim
  throw new Error('Perfil não encontrado');
  ```

### DTO (Data Transfer Object)

- Use Zod para validação, tipo forte para output:
  ```typescript
  // Entrada (validada)
  const InputSchema = z.object({
    perfilId: z.string().min(1),
    usuarioId: z.string().min(1),
  });
  type Input = z.infer<typeof InputSchema>;

  // Saída (tipada)
  type Output = {
    id: string;
    estado: 'reivindicado';
    usuarioId: string;
  };
  ```

### Genéricos

- Use genéricos só se necessário (reutilização real, não especulativa):
  ```typescript
  // ✅ Use: Repositório é genérico (real reutilização)
  interface Repositorio<T> {
    buscarPorId(id: string): Promise<T | null>;
  }

  // ❌ Evite: Um uso só
  type Result<T> = { ok: true; data: T } | { ok: false; error: Error };
  // Use instead: type Result = { ok: boolean; data?: X; error?: Error }
  ```

---

## 3. Tratamento de Erros

### Hierarquia

1. **Domain Errors** (lanças em domínio): violação de invariante, negócio inválido
2. **Application Errors** (lanças em aplicação): input inválido, recurso não encontrado, orquestração falhou
3. **Infrastructure Errors** (lanças em infra): DB erro, API erro, RLS negado
4. **Presentation Errors** (traduzidas em UI): mensagem em PT-BR para usuário

### Nomeação & Documentação

```typescript
// Domínio (invariante)
export class ErrorPerfilPendenteExigeOrigem extends Error {
  constructor() {
    super('Perfil pendente exige origem (D7).');
    this.name = 'ErrorPerfilPendenteExigeOrigem';
  }
}

// Aplicação (negócio)
export class ErrorPerfilNaoEncontrado extends Error {
  constructor(perfilId: string) {
    super(`Perfil ${perfilId} não encontrado.`);
    this.name = 'ErrorPerfilNaoEncontrado';
  }
}

// Infra (técnico)
export class ErrorSupabaseRLS extends Error {
  constructor(public readonly causa: Error) {
    super('Sem permissão para acessar este recurso.');
    this.name = 'ErrorSupabaseRLS';
  }
}

// UI (traduzido)
export class ErrorUI {
  static perfilNaoEncontrado() {
    return 'Perfil não encontrado. Verifique se o link está correto.';
  }
  static semPermissao() {
    return 'Você não tem permissão para acessar esse perfil.';
  }
}
```

### Jamais Absorver Erros Silenciosamente

```typescript
// ❌ Ruim: absorve erro
try {
  await repo.salvar(perfil);
} catch (err) {
  console.log('erro ao salvar');
}

// ✅ Bom: re-lança ou trata
try {
  await repo.salvar(perfil);
} catch (err) {
  if (err instanceof ErrorRLS) {
    throw new ErrorSemPermissao();
  }
  throw err; // re-lança se desconhecido
}
```

---

## 4. Testes

### Padrão: Arrange → Act → Assert

```typescript
describe('ReivindicarPerfil', () => {
  it('reivindicação bem-sucedida transiciona estado', async () => {
    // Arrange
    const repo = new RepositorioFake();
    const caso = new ReivindicarPerfil(repo);
    const perfil = Perfil.criar({ ... });
    await repo.salvar(perfil);

    // Act
    const resultado = await caso.executar({
      perfilId: perfil.id,
      usuarioId: 'user-123',
    });

    // Assert
    expect(resultado.estado).toBe('reivindicado');
  });
});
```

### Cobertura por Camada

| Camada | Cobertura Mínima | O Que Testar |
|--------|------------------|--------------|
| **Domínio** | 80%+ | Invariantes (happy path + edge), value objects, transições de estado |
| **Aplicação** | 70%+ | Use cases (input validation, error handling, orquestração) |
| **Infra** | 60%+ | Adapter (parsing, RLS, idempotência), sem DB real |
| **UI (React)** | 50%+ | Render, click handlers, estado (loading, error, success) |
| **IA (Cairo)** | 75%+ | Prompt output validation (schema), fallback, timeout |

### Nomes de Testes

- Descritivo, não genérico:
  ```typescript
  // ✅ Bom
  it('rejeita perfil pendente sem origem', () => { })
  it('reivindicação é idempotente para o mesmo usuário', () => { })
  it('fallback retorna erro específico se API timeout', () => { })

  // ❌ Ruim
  it('test 1', () => { })
  it('works', () => { })
  ```

### Fixture vs. Factory

- Use factory se reutilizar em múltiplos testes:
  ```typescript
  function criarPerfilPendente(): Perfil {
    return Perfil.criar({
      handle: 'test-handle',
      tipo: 'creator',
      estado: 'pendente',
      origem: { oportunidadeId: 'opp-1', assessorId: 'ass-1' },
    });
  }
  ```

---

## 5. Git & Commits

### Tamanho de Commit

- Pequeno = uma responsabilidade = fácil de reverter. Máx ~50 linhas de código.
  ```
  ❌ Ruim:  "Implementa Perfil, ReivindicarPerfil, migration, tests tudo junto"
  ✅ Bom:  
    Commit 1: "domain: Entidade Perfil + invariante D7 com testes"
    Commit 2: "domain: Value object Handle com validação"
    Commit 3: "infra: Migration perfis idempotente"
    Commit 4: "infra: PerfilRepositorioSupabase adapter"
    Commit 5: "aplicação: Caso de uso ReivindicarPerfil"
  ```

### Mensagem de Commit

- **Formato:** `<camada>: <descrição breve>`
- **PT-BR, imperativo, sem ponto final**
- **Linha 1:** máx 60 caracteres (o que muda)
- **Linha 3+:** Por quê e contexto (se relevante)

```
domain: Entidade Perfil com invariante D7

Perfil pendente exige origem (oportunidade + assessor que vinculou).
Teste D7 como execução: criação falha sem origem.
Preserva origem em reivindicação (imutável).

Ref: CLAUDE.md seção 3 (Claim profile pela porta da oportunidade)
```

### Commits Não Permitidos

```
❌ "fix bug"
❌ "update code"
❌ "WIP"
❌ "ajustes" (muito vago)
❌ "conforme conversado" (remonta contexto que não está em arquivo)
```

### Branch Naming

- `<especialista>/<feature>-<ticket-ou-numero>`
- Ex: `beatriz/perfil-invariante-d7`, `rodrigo/migration-perfis`, `marina/reivindicar-caso-uso`

---

## 6. Estrutura de Arquivos

### Padrão Hexagonal (Ports & Adapters)

```
src/
├── domain/
│   ├── perfil/
│   │   ├── Perfil.ts           (entidade)
│   │   ├── Handle.ts           (value object)
│   │   └── Perfil.spec.ts      (testes de domínio)
│   ├── oportunidade/
│   └── prova/
│
├── ports/
│   ├── perfil-repositorio.ts   (interface/porta)
│   └── IA-extrator.ts
│
├── aplicacao/
│   ├── ReivindicarPerfil.ts    (caso de uso)
│   ├── VincularCreatorAoSquad.ts
│   └── ReivindicarPerfil.spec.ts
│
├── infra/
│   ├── supabase/
│   │   ├── PerfilRepositorioSupabase.ts  (adapter)
│   │   └── PerfilRepositorioSupabase.spec.ts
│   ├── anthropic/
│   │   ├── prompts/
│   │   │   └── extrair-ticket.md
│   │   ├── schemas.ts          (Zod schemas)
│   │   └── ExtratorSupabase.ts
│   └── next-auth/
│       └── auth.config.ts
│
├── app/                         (Next.js routes & UI)
│   ├── (autenticado)/
│   │   └── reivindicar/
│   │       ├── page.tsx
│   │       └── BotaoReivindicar.tsx
│   └── api/
│
└── lib/
    └── errors.ts               (erro central)
```

### O Que Vai Aonde

- **domain/**: Nada de Supabase, HTTP, IA. Só lógica de negócio + testes.
- **ports/**: Interfaces (sem implementação).
- **aplicacao/**: Orquestração. Conhece ports, não implementações.
- **infra/**: Implementations de ports. Conhece Supabase, Anthropic, Next.js.
- **app/**: React components, Next.js pages. Chamam aplicacao/.

---

## 7. Documentação Inline

### O Que Documentar (Raramente)

- **Invariantes:** por quê a regra existe (se não óbvio no nome)
- **Workarounds:** por quê não é óbvio (bug do provider, limitação, etc)
- **Decisões arquiteturais:** referência para ADR

### O Que Não Documentar

- WHAT (o código já diz; bom nome é suficiente)
- HOW de código legível (for loop, map, if)

### Exemplo

```typescript
// ❌ Ruim
function calcularConfianca(papeis: number) {
  // aumenta confiança
  return papeis * 10;
}

// ✅ Bom
function calcularConfianca(papelCount: number): Confianca {
  // Confiança cresce linear com papéis distintos.
  // Mínimo 1 papel (15%), máximo 10 papéis (100%).
  // Ref: spec 02 — Reputação = Lastro, nunca score
  return Math.min(100, Math.max(15, papelCount * 10)) as Confianca;
}
```

---

## 8. Padrões React (Letícia)

### Server vs. Client Components

- **Default = server** (async data fetching, seguro)
- **'use client' = mínimo** (só estado local + interações)

```typescript
// ❌ Desnecessário
'use client';
export default function TelaReivindicar() {
  const [perfil, setPerfil] = useState(null);
  useEffect(() => {
    fetch('/api/perfil/123').then(r => r.json()).then(setPerfil);
  }, []);
}

// ✅ Correto
export default async function TelaReivindicar({ params: { perfilId } }) {
  const perfil = await buscarPerfil(perfilId); // server async
  return <BotaoReivindicar perfil={perfil} />;
}

'use client';
export function BotaoReivindicar({ perfil }) {
  const [estado, setEstado] = useState('idle');
  return <button onClick={() => reivindicar()}>...</button>;
}
```

### Props Tipagem (Componentes)

- Type-safe, sem `any`, interface para props complexas:
  ```typescript
  interface BotaoReivindicarProps {
    perfilId: string;
    onSucesso: () => void;
    onErro: (erro: Error) => void;
  }

  export function BotaoReivindicar(props: BotaoReivindicarProps) { }
  ```

### Estados de Componente

- Sempre `idle | loading | success | error`:
  ```typescript
  type Estado = 'idle' | 'loading' | 'success' | 'error';
  const [estado, setEstado] = useState<Estado>('idle');
  ```

---

## 9. Migrations SQL (Rodrigo)

### Naming

- `<data>_<numero>_<descricao>.sql`
- Ex: `20260722000001_perfis_criar.sql`

### Regra de Ouro: Idempotent

```sql
-- ✅ Bom (pode rodar 2x, ok)
CREATE TABLE IF NOT EXISTS perfis (
  id TEXT PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  ...
);

-- ❌ Ruim (2x = erro)
CREATE TABLE perfis (
  ...
);
```

### Constraints como Defesa de D7

```sql
CREATE TABLE perfis (
  id TEXT PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  usuario_id UUID UNIQUE,
  estado TEXT NOT NULL CHECK (estado IN ('pendente', 'reivindicado')),
  
  -- D7: Perfil pendente exige origem
  origem_oportunidade_id UUID,
  origem_assessor_id UUID,
  origem_vinculado_em TIMESTAMP,
  
  CONSTRAINT perfis_pendente_exige_origem CHECK (
    estado <> 'pendente' OR (
      origem_oportunidade_id  IS NOT NULL AND
      origem_assessor_id      IS NOT NULL AND
      origem_vinculado_em     IS NOT NULL AND
      usuario_id              IS NULL
    )
  )
);
```

### RLS (Deny-by-Default)

```sql
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- Deny tudo por padrão
CREATE POLICY perfis_deny_all ON perfis FOR ALL TO public USING (false);

-- Pessoa vê o seu próprio (se reivindicado)
CREATE POLICY perfis_read_own ON perfis FOR SELECT
  USING (usuario_id = auth.uid());

-- Assessor vê pendentes que vinculou
CREATE POLICY perfis_read_pending_own ON perfis FOR SELECT
  USING (estado = 'pendente' AND origem_assessor_id = auth.uid());
```

---

## 10. Prompts de IA (Cairo)

### Armazenamento

- **Git, não código**. Arquivo markdown em `/src/infrastructure/anthropic/prompts/`.
- Versionado, auditável, testável.

### Estrutura Padrão

```markdown
# Extrator de Ticket de Oportunidade

## Responsabilidade
Transformar texto bruto (WhatsApp, email) em ticket estruturado.

## Entrada
Texto livre, até 10k caracteres.

## Saída (JSON)
```json
{
  "marca": "string ou null",
  "budget": "número ou null",
  "papeis": [{"funcao": "string", "qtd": número}],
  "confianca": "0-100"
}
```

## Regras
- Não adivinhe. Deixe null se não explícito.
- Confiança: 0-30 (pouco claro), 30-70 (parcial), 70-100 (claro).

## Exemplos

### Input
"Oi, procuro 2 fotógrafos. Marca Adidas, uns 10k."

### Output
{ "marca": "Adidas", "budget": 10000, ... }
```

### Validação com Zod

```typescript
const TicketSchema = z.object({
  marca: z.string().nullable(),
  budget: z.number().int().positive().nullable(),
  papeis: z.array(z.object({
    funcao: z.string(),
    qtd: z.number().int().positive(),
  })),
  confianca: z.number().int().min(0).max(100),
});
```

---

## 11. Code Review Checklist

Cada especialista usa **seu** checklist (em seu .md no `/docs/squad/`).

**Geral (todos os PRs):**
- ✅ Mensagem de commit clara (PT-BR, imperativo)?
- ✅ Testes adicionados/atualizados?
- ✅ `npm test` verde?
- ✅ `tsc --noEmit` verde (tipos corretos)?
- ✅ Sem `console.log`, `debugger`, `any`?
- ✅ Sem segredos (API keys, tokens, emails) commitados?

---

## Changelog

| Data | O Que | Por Quê |
|------|-------|--------|
| 2026-07-22 | Criado | Rulebook técnico unificado |
