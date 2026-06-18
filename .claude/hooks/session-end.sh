#!/bin/bash
set -euo pipefail

# SessionEnd hook — Massa Hub
# Salva um resumo estruturado da sessão em /docs/sessoes/ para persistência
# de memória entre sessões web efêmeras.
# Idempotente. Só roda no Claude Code na web.

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-/home/user/massa-hub-3.0}"
SESSOES_DIR="$PROJECT_DIR/docs/sessoes"

# Garante que a pasta existe
mkdir -p "$SESSOES_DIR"

# Nome do arquivo: data + hora (ou session ID se disponível)
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M')
SESSION_FILE="$SESSOES_DIR/${TIMESTAMP}.md"

# Só cria se não existir (idempotente em re-runs)
if [ -f "$SESSION_FILE" ]; then
  exit 0
fi

# Gera o arquivo de sessão com template estruturado
# O Claude Code vai preencher o conteúdo via instrução no settings,
# mas o template garante que ao menos o arquivo é criado com a estrutura.
cat > "$SESSION_FILE" << EOF
## Sessão $TIMESTAMP

### Objetivo
<!-- O que foi pretendido nesta sessão -->

### O que foi feito
<!-- Módulos, arquivos, funcionalidades implementadas -->

### Decisões tomadas
<!-- Qualquer decisão de design, arquitetura ou produto tomada durante a sessão -->

### Próximos passos
<!-- O que precisa ser feito na próxima sessão para continuar -->

### Arquivos criados/modificados
<!-- Lista dos arquivos alterados -->

### Pendências / blockers
<!-- O que está incompleto ou travado -->
EOF

echo "[session-end] sessão salva em: $SESSION_FILE"
