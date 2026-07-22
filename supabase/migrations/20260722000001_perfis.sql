-- =============================================================================
-- Migration: perfis
-- Criada em: 2026-07-22
-- Escopo: tabela `perfis` (o nó da rede), fundação do claim profile (spec 03).
--         Assessor e creator sao variacoes do mesmo nucleo — a distincao vive
--         em `tipo`. Persiste a entidade de dominio Perfil (src/domain/perfil).
-- =============================================================================

-- =============================================================================
-- TABELA: perfis
-- Dois estados (ver Perfil.ts):
--   - reivindicado: existe uma pessoa real (usuario_id de auth) por tras.
--   - pendente: criado por um assessor AO abrir uma oportunidade, ainda nao
--     reivindicado. So existe ANCORADO em trabalho real (origem) — invariante D7.
-- id e TEXT (id de dominio, string — ver Perfil.ts), como em `provas`. Um banco
-- novo com UUID quebraria o adapter, que persiste o id gerado no dominio.
-- =============================================================================
CREATE TABLE IF NOT EXISTS perfis (
  id                        TEXT        PRIMARY KEY,              -- id de dominio (string) — ver Perfil.ts
  tipo                      TEXT        NOT NULL
                            CHECK (tipo IN ('assessor', 'creator')),
  nome                      TEXT        NOT NULL,
  handle                    TEXT        NOT NULL,                 -- slug publico (/handle), normalizado no dominio
  estado                    TEXT        NOT NULL
                            CHECK (estado IN ('reivindicado', 'pendente')),
  usuario_id                TEXT,                                 -- auth user; presente sse reivindicado
  origem_oportunidade_id    TEXT,                                 -- a oportunidade que ancorou (se pendente)
  origem_vinculado_por_id   TEXT,                                 -- o assessor que vinculou (se pendente)
  origem_vinculado_em       TIMESTAMPTZ,                          -- quando foi vinculado (se pendente)
  criado_em                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- D7 como invariante de banco, nao so de dominio: um perfil pendente NUNCA
  -- existe sem ancora de trabalho real (oportunidade + assessor), e nunca ja
  -- carrega usuario_id. Espelha exatamente as regras de Perfil.criar().
  CONSTRAINT perfis_pendente_exige_origem CHECK (
    estado <> 'pendente' OR (
      origem_oportunidade_id  IS NOT NULL AND
      origem_vinculado_por_id IS NOT NULL AND
      usuario_id              IS NULL
    )
  ),
  -- Um perfil reivindicado exige a pessoa real por tras (usuario_id).
  CONSTRAINT perfis_reivindicado_exige_usuario CHECK (
    estado <> 'reivindicado' OR usuario_id IS NOT NULL
  )
);

-- -----------------------------------------------------------------------------
-- ÍNDICES / UNICIDADE — cobrem os padrões de query do adapter (PerfilRepositorio)
-- -----------------------------------------------------------------------------

-- buscarPorHandle: o handle e o identificador publico, unico na rede.
CREATE UNIQUE INDEX IF NOT EXISTS idx_perfis_handle
  ON perfis (handle);

-- buscarPorUsuario + regra "uma identidade, um no" (ReivindicarPerfil): um
-- usuario nunca reivindica dois perfis. NULLs sao distintos no Postgres, entao
-- os multiplos pendentes (usuario_id IS NULL) convivem sem violar o UNIQUE.
CREATE UNIQUE INDEX IF NOT EXISTS idx_perfis_usuario_id
  ON perfis (usuario_id);

-- listarPendentesVinculadosPor: a rede pendente que um assessor trouxe.
CREATE INDEX IF NOT EXISTS idx_perfis_vinculado_por
  ON perfis (origem_vinculado_por_id);


-- =============================================================================
-- ROW LEVEL SECURITY
-- Mesmo padrao das demais tabelas (ver 20260618000002_rls_hardening.sql):
-- RLS habilitado, deny-by-default, SEM politicas publicas. Todo acesso da
-- aplicacao e server-side via service role (criarClienteServidor), que bypassa
-- RLS. NAO criar politica aberta: com a anon key (publica), isso deixaria
-- qualquer um ler/escrever perfis via PostgREST. Politicas reais (a pessoa le
-- o proprio perfil; assessor le os pendentes que vinculou; leitura publica do
-- perfil reivindicado) entram junto com a UI publica de /handle.
-- =============================================================================
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
