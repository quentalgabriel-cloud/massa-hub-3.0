-- =============================================================================
-- Migration: oportunidades_e_provas
-- Criada em: 2026-06-18
-- Escopo: tabelas de Lastro (provas + assinaturas) e Oportunidades, com RLS base
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUM: status_oportunidade
-- Controla o ciclo de vida de uma oportunidade publicada pelo assessor.
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE status_oportunidade AS ENUM ('aberta', 'em_selecao', 'fechada');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- =============================================================================
-- TABELA: provas
-- Unidade atômica do Lastro. Registro de trabalho real, assinado pelos dois lados.
-- =============================================================================
CREATE TABLE IF NOT EXISTS provas (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo              TEXT        NOT NULL,                     -- TipoProva enum (ex: 'campanha', 'conteudo', 'consultoria')
  titulo            TEXT        NOT NULL,
  descricao         TEXT        NOT NULL,
  resultado         TEXT,                                     -- nullable — nem toda prova tem resultado mensurável
  criador_id        TEXT        NOT NULL,                     -- perfilId de quem realizou o trabalho
  contratante_id    TEXT        NOT NULL,                     -- perfilId de quem contratou
  participantes     TEXT[]      NOT NULL DEFAULT '{}',        -- outros perfis envolvidos
  data              DATE        NOT NULL,                     -- data de realização/entrega
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABELA: assinaturas
-- Registro bilateral que valida a prova. Sem as duas assinaturas, a prova não
-- tem Lastro completo. ON DELETE CASCADE garante limpeza ao remover uma prova.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assinaturas (
  prova_id          UUID        NOT NULL REFERENCES provas(id) ON DELETE CASCADE,
  autor_id          TEXT        NOT NULL,                     -- perfilId de quem assinou
  papel             TEXT        NOT NULL CHECK (papel IN ('criador', 'contratante')),
  assinado_em       TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (prova_id, autor_id)
);


-- =============================================================================
-- TABELA: oportunidades
-- Ticket estruturado publicado pelo assessor, gerado a partir de texto bruto
-- (WhatsApp/e-mail) via extração por IA.
-- =============================================================================
CREATE TABLE IF NOT EXISTS oportunidades (
  id                          UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id                    TEXT                  NOT NULL,    -- perfilId do assessor que publicou
  marca                       TEXT                  NOT NULL,
  status                      status_oportunidade   NOT NULL DEFAULT 'aberta',
  budget                      NUMERIC,                           -- nullable — nem toda oportunidade tem budget definido
  prazo                       DATE,                              -- nullable — data-limite para candidaturas
  local                       TEXT,                              -- nullable — cidade/local do projeto
  regiao                      TEXT,                              -- nullable — região geográfica
  entregaveis                 TEXT[]                NOT NULL DEFAULT '{}',
  candidaturas                TEXT[]                NOT NULL DEFAULT '{}',  -- array de perfilId
  papeis                      JSONB                 NOT NULL DEFAULT '[]',  -- [{funcao, qtd, nicho, seguidores_min, seguidores_max}]
  origem_texto_bruto          TEXT                  NOT NULL,   -- briefing original colado pelo assessor
  origem_estruturado_por_ia   BOOLEAN               NOT NULL DEFAULT FALSE,
  origem_revisado_pelo_autor  BOOLEAN               NOT NULL DEFAULT FALSE,
  criado_em                   TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- ÍNDICES
-- Cobrem os padrões de query dos adapters: listar por autor, filtrar por status,
-- ordenar por data de criação.
-- =============================================================================

-- oportunidades
CREATE INDEX IF NOT EXISTS idx_oportunidades_autor_id
  ON oportunidades (autor_id);

CREATE INDEX IF NOT EXISTS idx_oportunidades_status
  ON oportunidades (status);                                     -- usado em listarAbertas (WHERE status = 'aberta')

CREATE INDEX IF NOT EXISTS idx_oportunidades_criado_em
  ON oportunidades (criado_em DESC);                             -- ORDER BY criado_em no adapter

-- provas
CREATE INDEX IF NOT EXISTS idx_provas_criador_id
  ON provas (criador_id);

-- assinaturas
CREATE INDEX IF NOT EXISTS idx_assinaturas_prova_id
  ON assinaturas (prova_id);


-- =============================================================================
-- ROW LEVEL SECURITY
-- Habilitado em todas as tabelas. Políticas de auth real serão refinadas antes
-- da produção — ver supabase/migrations/README.md.
-- =============================================================================

ALTER TABLE provas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Políticas: oportunidades
-- -----------------------------------------------------------------------------

-- DROP antes de CREATE: Postgres não aceita IF NOT EXISTS em CREATE POLICY,
-- então removemos antes para tornar a migration re-executável sem erro.

-- Leitura pública para oportunidades abertas (sem autenticação necessária)
DROP POLICY IF EXISTS "oportunidades abertas sao publicas" ON oportunidades;
CREATE POLICY "oportunidades abertas sao publicas"
  ON oportunidades FOR SELECT
  USING (status = 'aberta');

-- Placeholder de escrita autenticada — será substituído por política real
-- que valida auth.uid() = autor_id quando o auth estiver integrado.
DROP POLICY IF EXISTS "autor pode inserir e atualizar" ON oportunidades;
CREATE POLICY "autor pode inserir e atualizar"
  ON oportunidades FOR ALL
  USING (true) WITH CHECK (true);
