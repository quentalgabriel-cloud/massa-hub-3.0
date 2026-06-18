-- =============================================================================
-- Migration: rls_hardening
-- Criada em: 2026-06-18
-- =============================================================================
-- Remove as politicas RLS abertas de `oportunidades` que a migration anterior
-- havia aplicado no banco de producao.
--
-- A politica de escrita `FOR ALL USING(true) WITH CHECK(true)` era um buraco de
-- seguranca: com a anon/publishable key (que e publica, vai pro browser), qualquer
-- um poderia inserir/atualizar/apagar oportunidades direto via PostgREST.
--
-- A aplicacao acessa `oportunidades` exclusivamente server-side via service role
-- (criarClienteServidor), que bypassa RLS — entao remover estas politicas NAO
-- quebra o app. Politicas reais (auth.uid() = autor_id; leitura publica de
-- 'aberta') entram no Ciclo 5, junto com o Supabase Auth.
-- =============================================================================

DROP POLICY IF EXISTS "autor pode inserir e atualizar" ON oportunidades;
DROP POLICY IF EXISTS "oportunidades abertas sao publicas" ON oportunidades;
