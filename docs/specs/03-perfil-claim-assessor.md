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
assessor (a ativação por e-mail é growth loop da Fase 2). A migration precisa ser
aplicada no Supabase antes do uso em produção.

## Fora de escopo agora (não construir)

- Portfólio visual rico (galeria, cases, vídeos) — incremental, depois do trilho.
- Feed / conexões sociais / postagens — fase 2.
- Ligar o perfil reivindicado às oportunidades do usuário (hoje `publicar`/
  `candidatar` usam `user.id` como `perfilId` direto) — reconciliação de uma
  próxima camada, não da Fase 1.
