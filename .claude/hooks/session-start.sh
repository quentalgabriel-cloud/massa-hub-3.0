#!/bin/bash
set -euo pipefail

# SessionStart hook — Massa Hub
# Garante as dependências de runtime da skill /watch (claude-video) em cada
# sessão web (container remoto e efêmero). Idempotente e rápido quando já presentes.

# Só roda no Claude Code na web; em máquina local não mexe no sistema.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# ffmpeg + ffprobe (apt) — instala só se faltar algum.
if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
  sudo apt-get update -q
  sudo apt-get install -y -q ffmpeg
fi

# yt-dlp (pip --user) — instala só se faltar.
if ! command -v yt-dlp >/dev/null 2>&1 && ! python3 -m yt_dlp --version >/dev/null 2>&1; then
  pip3 install --quiet --user yt-dlp
fi

# faster-whisper (Whisper LOCAL, grátis) — transcreve vídeos sem legenda sem API paga.
# Modelo 'small': bom equilíbrio precisão/velocidade em PT e EN (detecção automática).
# Best-effort: se a instalação pesada falhar, frames + legendas nativas seguem funcionando.
WATCH_WHISPER_MODEL="${WATCH_WHISPER_MODEL:-small}"
if ! python3 -c "import faster_whisper" >/dev/null 2>&1; then
  pip3 install --quiet --user faster-whisper || true
fi
# Pré-baixa o modelo uma vez (fica no cache do container) p/ a 1ª transcrição não travar.
python3 - "$WATCH_WHISPER_MODEL" >/dev/null 2>&1 <<'PY' || true
import sys
from faster_whisper import WhisperModel
WhisperModel(sys.argv[1], device="cpu", compute_type="int8")
PY

# pip --user instala em ~/.local/bin; garante no PATH da sessão.
# Fixa o modelo padrão do /watch p/ as chamadas desta sessão.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$CLAUDE_ENV_FILE"
  echo "export WATCH_WHISPER_MODEL=\"$WATCH_WHISPER_MODEL\"" >> "$CLAUDE_ENV_FILE"
fi
