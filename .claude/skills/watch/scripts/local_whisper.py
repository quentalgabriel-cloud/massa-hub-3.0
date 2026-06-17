#!/usr/bin/env python3
"""Local Whisper transcription via faster-whisper — free, no API, runs on CPU.

Same output shape as whisper.transcribe_video and transcribe.parse_vtt, so the
rest of the pipeline (filter_range, format_transcript) doesn't care where the
transcript came from. The model is downloaded once and cached under
~/.cache/huggingface; no network call per request beyond that first download.

Tunable via env:
  WATCH_WHISPER_MODEL    model size: tiny|base|small|medium|large-v3 (default: base)
  WATCH_WHISPER_COMPUTE  ctranslate2 compute type (default: int8 — fast/low-mem on CPU)
  WATCH_WHISPER_LANG     force a language code (e.g. "pt"); default: auto-detect
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(SCRIPT_DIR))

from whisper import extract_audio  # noqa: E402  (reuse the mono-16k extractor)


DEFAULT_MODEL = (os.environ.get("WATCH_WHISPER_MODEL") or "small").strip() or "small"
DEFAULT_COMPUTE = (os.environ.get("WATCH_WHISPER_COMPUTE") or "int8").strip() or "int8"


def is_available() -> bool:
    """True if faster-whisper is importable in this interpreter."""
    try:
        import importlib.util

        return importlib.util.find_spec("faster_whisper") is not None
    except Exception:
        return False


def transcribe_local(
    audio_path: Path,
    model_name: str | None = None,
    language: str | None = None,
) -> list[dict]:
    """Transcribe an audio file locally. Returns {start, end, text} segments."""
    from faster_whisper import WhisperModel

    model_name = model_name or DEFAULT_MODEL
    lang = language or (os.environ.get("WATCH_WHISPER_LANG") or None)

    model = WhisperModel(model_name, device="cpu", compute_type=DEFAULT_COMPUTE)
    segments_iter, _info = model.transcribe(
        str(audio_path),
        beam_size=1,
        vad_filter=True,
        language=lang,
    )

    out: list[dict] = []
    for seg in segments_iter:
        text = (seg.text or "").strip()
        if not text:
            continue
        out.append({
            "start": round(float(seg.start or 0.0), 2),
            "end": round(float(seg.end or 0.0), 2),
            "text": text,
        })
    return out


def transcribe_video_local(
    video_path: str,
    audio_out: Path,
    model_name: str | None = None,
    language: str | None = None,
) -> tuple[list[dict], str]:
    """Extract audio then transcribe locally. Returns (segments, label).

    Raises SystemExit on failure, matching whisper.transcribe_video's contract.
    """
    model_name = model_name or DEFAULT_MODEL
    print(
        f"[watch] extracting audio for local Whisper (faster-whisper:{model_name})…",
        file=sys.stderr,
    )
    audio_path = extract_audio(video_path, audio_out)
    print(
        f"[watch] transcribing locally (faster-whisper {model_name}, {DEFAULT_COMPUTE}) — "
        "first run downloads the model once…",
        file=sys.stderr,
    )
    try:
        segments = transcribe_local(audio_path, model_name=model_name, language=language)
    except ImportError as exc:
        raise SystemExit(
            "faster-whisper is not installed. Install with: pip install --user faster-whisper"
        ) from exc
    except Exception as exc:  # model download / decode / runtime errors
        raise SystemExit(f"local Whisper failed: {exc}") from exc

    if not segments:
        raise SystemExit("local Whisper returned no transcript segments")

    print(
        f"[watch] transcribed {len(segments)} segments via local faster-whisper ({model_name})",
        file=sys.stderr,
    )
    return segments, f"local ({model_name})"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: local_whisper.py <video-or-audio-path> [<audio-out.mp3>]", file=sys.stderr)
        raise SystemExit(2)
    import json

    src = sys.argv[1]
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("audio.mp3")
    segs, label = transcribe_video_local(src, out)
    print(json.dumps({"backend": label, "segments": segs}, indent=2))
