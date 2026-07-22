-- =============================================================================
-- Migration: perfis
-- Criada em: 2026-07-22
-- Escopo: tabela de Perfil (o no do grafo da rede) — diretorio + claim minimo.
-- Ciclo 6b. Ver docs/specs/03-perfil-claim-assessor.md.
-- =============================================================================
-- O perfilId ja circula como aresta em provas/oportunidades (criador_id,
-- contratante_id, candidaturas) como TEXT. Ate aqui esses ids eram "crus" (o id
-- da sessao). Esta tabela da nome e cara a eles. Por isso `id` e TEXT (id de
-- dominio) — no self-claim ele e igual ao id do usuario de auth (ver
-- CriarOuAtualizarPerfilProprio), mantendo as arestas ja gravadas coerentes.

CREATE TABLE IF NOT EXISTS perfis (
  id            TEXT        PRIMARY KEY,                          -- perfilId de dominio (ver Perfil.ts)
  usuario_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,  -- dono quando reivindicado (claim); NULL = ancorado, aguardando ativacao
  handle        TEXT        NOT NULL UNIQUE,                      -- identificador publico massahub.com.br/<handle>
  nome          TEXT        NOT NULL,
  papel         TEXT        NOT NULL
                CHECK (papel IN ('assessor', 'creator', 'profissional')),
  tags          TEXT[]      NOT NULL DEFAULT '{}',
  avatar_url    TEXT,
  bio           TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INDICES
-- Cobrem os padroes de query do adapter PerfilRepositorioSupabase:
-- buscar por handle (pagina publica), por usuario (editar o proprio), e o
-- diretorio (ILIKE em nome/handle).
-- -----------------------------------------------------------------------------
-- handle ja tem indice unico implicito pela constraint UNIQUE.
CREATE INDEX IF NOT EXISTS idx_perfis_usuario_id
  ON perfis (usuario_id);

CREATE INDEX IF NOT EXISTS idx_perfis_nome_lower
  ON perfis (LOWER(nome));

-- =============================================================================
-- ROW LEVEL SECURITY
-- Mesma postura das demais tabelas (migration 20260618000002_rls_hardening):
-- RLS habilitado, deny-by-default, SEM politicas abertas. Todo acesso da
-- aplicacao e server-side via service role (criarClienteServidor), que bypassa
-- RLS — inclusive a pagina publica /<handle>, que e um Server Component. NAO
-- criar politica de escrita aberta: com a anon key (publica) isso permitiria
-- qualquer um alterar perfis via PostgREST. Politicas reais por auth.uid()
-- (dono edita o proprio; leitura publica) podem ser refinadas depois.
-- =============================================================================

ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
