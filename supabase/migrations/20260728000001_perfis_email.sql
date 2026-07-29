-- =============================================================================
-- Migration: perfis_email
-- Criada em: 2026-07-28 (Fase 2 — ativação por e-mail)
-- Escopo: contato opcional no nó da rede, para convidar alguém a reivindicar
--         o próprio perfil.
-- =============================================================================

-- E-mail é CONTATO, nunca identidade — quem identifica é `handle` (público) e
-- `usuario_id` (auth). Por isso: nullable e SEM unicidade. Duas pessoas podem
-- compartilhar um contato (ex.: o e-mail da agência) sem que isso funda dois
-- nós da rede. Não interfere no D7: pendente segue exigindo origem.
ALTER TABLE perfis
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Busca por contato ao convidar em lote. Parcial: só as linhas com e-mail.
CREATE INDEX IF NOT EXISTS idx_perfis_email
  ON perfis (email)
  WHERE email IS NOT NULL;
