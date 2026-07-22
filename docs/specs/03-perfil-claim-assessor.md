# Spec — Perfil & Claim Profile do Assessor

Status: claim do assessor = Fase 1 (mínimo viável). Perfil rico = incremental.

## Perfil (forma visual)

Referência: GitHub profile, não Behance. A ordem de leitura importa:

1. **Band de identidade**: avatar, nome, handle (`massahub.com.br/handle`), papel,
   tags. A tag de tipo do assessor deve aparecer **em destaque** (violeta), não
   misturada com as demais.
2. **Provas em destaque** (ver spec 01) — o conteúdo que vende a pessoa. Vem antes
   de tudo no mobile.
3. **Ritmo** (heatmap) — só se houver dados.
4. **Lastro** (fatos contáveis) na coluna lateral.
5. Sobre, áreas de atuação, marcas que assinam provas, rede (conexões/colaborações).

No mobile, reordenar: Provas + Ritmo primeiro, Sobre/Lastro depois.

## Claim Profile do Assessor (Fase 1 — mínimo)

A porta de entrada da rede. O assessor é o super-nó que traz os creators.

Fluxo mínimo:
1. Assessor tem perfil (próprio, diferente do perfil de creator).
2. Ao abrir uma oportunidade (spec 02), ele pode **vincular creators da sua rede**
   ao squad — criando/ligando perfis.
3. Cada creator vinculado a um trabalho real nasce com uma aresta de Lastro.
4. O creator recebe um convite para **ativar** o próprio perfil (verificar que é ele,
   conectar contas, completar).

⚠️ Regra dura: **não criar perfil de creator sem âncora de trabalho real.** O claim
acontece pela oportunidade, não por cadastro em massa. Perfil sem aresta = base
degradável (proibido, ver CLAUDE.md seção 3 e 5).

## Perfil de assessor ≠ perfil de creator

O perfil do assessor enfatiza: rede representada, marcas atendidas, squads montados,
histórico de oportunidades abertas. O do creator enfatiza: provas próprias, nicho,
contas conectadas. Modelar como variações do mesmo núcleo, não duas entidades soltas.

## Estado da implementação (Fase 1 — concluída)

O claim mínimo foi construído em 3 camadas hexagonais (domínio → aplicação → infra/UI):

- **Domínio**: `Perfil` (estados `pendente | reivindicado`) + `Handle`, com D7 como
  invariante executável (`Perfil.criar` recusa pendente sem origem). Porta
  `PerfilRepositorio`.
- **Aplicação**: `VincularCreatorAoSquad` (chaveado por handle: cria pendente novo
  ancorado OU reusa existente; liga via `Oportunidade.candidatar`) e
  `ReivindicarPerfil` ("uma identidade, um nó").
- **Infra/UI**: `PerfilRepositorioSupabase` + migration `perfis` (D7 também como
  CHECK no banco, RLS deny-by-default). Na Screen 10, o assessor vincula creator
  ao squad **após publicar** — só então existe uma oportunidade real para ancorar
  o pendente. A pessoa reivindica em `/reivindicar/[perfilId]` (reusa Google auth).

Sem e-mail na Fase 1: o link de reivindicação é distribuído manualmente pelo
assessor (a ativação por e-mail é growth loop da Fase 2).

### Onda 2 — o assessor logado é um Perfil real (concluída)

Fechou o fio solto: `publicar`/`vincular` usavam `user.id` (id de auth) como se
fosse `perfilId`, e o assessor não tinha nó em `perfis`. Agora:

- `Handle.aPartirDe(bruto)` deriva um handle válido do nome/e-mail do Google.
- `GarantirPerfilDoAssessor` faz get-or-create idempotente de um Perfil
  `reivindicado` do tipo assessor (handle desambiguado por sufixo em colisão),
  **sem formulário de onboarding** — provisiona no primeiro uso.
- As actions de oportunidade usam `perfil.id` do assessor como `autorId`/
  `assessorId`. O nó passa a existir: `/handle` e Lastro deixam de ficar órfãos.

**Schema aplicado no Supabase** (as 4 tabelas da Fase 1 existem; o banco estava
vazio). Para o app deployado funcionar, `SUPABASE_SERVICE_ROLE_KEY` precisa estar
setada no ambiente do Vercel (o adapter acessa via service role).

## Fora de escopo agora (não construir)

- Portfólio visual rico (galeria, cases, vídeos) — incremental, depois do trilho.
- Feed / conexões sociais / postagens — fase 2.
- **Reconciliação de `candidatar` e das provas** (namespace de `perfilId`). O
  assessor já foi reconciliado (Onda 2, acima). Falta o mesmo para: a
  auto-candidatura do creator (`oportunidades/[id]/actions.ts` ainda usa
  `user.id`) e as ações de prova (`RegistrarProva`/`AssinarProva` usam
  `criador_id`/`contratante_id`). Fica para a onda que habilitar "ver candidatos"
  — o self-review do PR #9 marcou esse acoplamento. **Não é regressão**: hoje só
  se lê `.length` das candidaturas; nada quebra até essa feature existir.
