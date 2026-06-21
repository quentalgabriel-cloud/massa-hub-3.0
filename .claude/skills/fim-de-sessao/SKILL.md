---
name: fim-de-sessao
description: Use quando o usuário pedir para encerrar a sessão, resumir o que foi feito, ou disser algo como "vamos parar por aqui", "fecha por hoje", "resume a sessão". Produz o resumo estruturado, atualiza specs/decisões se necessário, e commita.
allowed-tools: Read, Bash, Edit, Write
---

## Estado atual do repositório

!`cd /home/user/massa-hub-3.0 && git status --short && echo "---" && git diff --stat HEAD`

## Instruções

1. **Resuma a sessão em até 5 linhas**: objetivo, o que foi feito, decisões tomadas,
   pendências. (Replica o prompt recorrente "Fim de sessão" de `PROMPTS.md`.)

2. **Verifique se algum spec (`docs/specs/*`) ou `docs/decisoes/log.md` precisa de
   atualização** por causa do que foi implementado nesta sessão. Só edite se houve uma
   mudança real de decisão — não edite por hábito ou para "deixar mais completo".

3. **Preencha o arquivo de sessão.** Procure o arquivo mais recente em
   `docs/sessoes/*.md` criado hoje (o hook `session-end.sh` cria a casca vazia, só em
   sessão remota — `CLAUDE_CODE_REMOTE=true`). Se existir e estiver vazio, preencha as
   seções (Objetivo, O que foi feito, Decisões tomadas, Próximos passos, Arquivos
   criados/modificados, Pendências/blockers) com o conteúdo real desta sessão. Se não
   existir (sessão local, hook não rodou), crie um novo seguindo o mesmo nome de
   arquivo (`YYYY-MM-DD_HH-MM.md`) e a mesma estrutura de seções.

4. **Commits pequenos e descritivos em PT-BR** (CLAUDE.md seção 10). Rode
   `git status` e `git diff` antes de comitar — nunca inclua arquivo fora do escopo da
   sessão atual.

5. **Liste pendências de forma retomável**: escreva como se a próxima sessão começasse
   sem ter lido esta conversa — específico o bastante para retomar sem releitura
   completa do código.

Esta skill não substitui `session-end.sh` — o hook garante que a estrutura exista em
ambiente remoto efêmero; a skill garante que o conteúdo tenha substância, em qualquer
ambiente (local ou remoto).
