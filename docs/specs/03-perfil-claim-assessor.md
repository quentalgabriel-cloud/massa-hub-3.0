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

### Ondas 3–5 — superfície de reputação e rede (concluídas)

Com o nó do assessor real, o arco de reputação foi fechado:

- **Onda 3** — página pública `/[handle]` (`VerPerfilPublico`): só fatos
  contáveis (Lastro do creator / Atividade do assessor), sem score, sem heatmap
  vazio, sem vitrine. DTO não vaza `usuario_id`.
- **Onda 4 / 4b** — a rede tecida: detalhe da oportunidade → `/handle` do autor
  (clicável); `/handle` do assessor → seus tickets; e atribuição "por @handle"
  em cada card da lista (`buscarPorIds` em lote, sem N+1).
- **Onda 5** — entrada "meu perfil" no header: resolve o Perfil do logado e
  redireciona ao `/handle`, ou mostra empty state honesto. **Não auto-provisiona**
  (isso quebraria o claim do creator) — o nó nasce lazy, nas ações reais.

## Fora de escopo agora (não construir)

- Portfólio visual rico (galeria, cases, vídeos) — incremental, depois do trilho.
- Feed / conexões sociais / postagens — fase 2.
- ~~Reconciliação de `candidatar`~~ — **feito na Onda 7** (abaixo). Não há mais
  nenhum ponto do app usando `user.id` como `perfilId`.

### Onda 6 — o Lastro ligado ao grafo (concluída)

Correção de um bug real, achado em revisão: as provas gravavam
criador/contratante/assinante com `user.id` (auth), enquanto `VerPerfilPublico`
lê provas por `perfil.id`. **O Lastro no `/handle` seria sempre zero**, mesmo com
provas assinadas — a superfície de reputação (D1) quebrada em silêncio.

- `ResolverPerfis` (aplicação): sessão → perfil, `@handle` → perfil, com erros
  orientadores. Não cria perfil (D7 — o nó nasce do trabalho).
- Ações de prova usam `perfil.id` e revalidam os `/handle` afetados.
- `/provas` lista pelo perfil e mostra "Nome · @handle" (contrapartes resolvidas
  em lote, sem N+1); o form pede `@handle` no lugar de um UUID digitado à mão.

Lição registrada: na Onda 3/4 essa reconciliação foi classificada como YAGNI —
correto naquele momento, e **invalidado pela própria Onda 3**, que criou o
consumidor (`/handle` lendo provas por perfilId). Dívida vira bug quando o
consumidor aparece; revisar classificações de YAGNI a cada onda que adiciona
leitura nova.

### Onda 7 — ver o squad, e o último namespace (concluída)

- `candidatar` passa a usar `perfil.id`. **Nenhum ponto do app usa mais
  `user.id` como `perfilId`** — o grafo é coerente de ponta a ponta.
- O detalhe da oportunidade mostra o squad montado: "Nome · @handle", link para
  cada `/handle`, marca de "pendente" em quem ainda não reivindicou. Resolvido
  em lote (`buscarPorIds`). Antes existia só uma contagem opaca.
