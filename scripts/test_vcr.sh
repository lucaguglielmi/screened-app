#!/usr/bin/env bash
# ==============================================================================
# Screened VCR Test Runner (Record & Replay for LLM HTTP calls)
# Usage:
#   ./scripts/test_vcr.sh [mock|replay|record] [optional pytest args...]
# Examples:
#   ./scripts/test_vcr.sh mock                    # Default fast offline in-memory mock ($0)
#   ./scripts/test_vcr.sh replay tests/test_vcr_toggle.py  # Run with VCR cassette replay
#   ./scripts/test_vcr.sh record tests/test_vcr_toggle.py  # Record live traffic to cassettes
# ==============================================================================

set -euo pipefail

MODE="${1:-mock}"
shift || true

PYTHON_BIN=".venv/bin/python"
if [ ! -f "$PYTHON_BIN" ]; then
    if [ -f "venv/bin/python" ]; then
        PYTHON_BIN="venv/bin/python"
    else
        PYTHON_BIN="python3"
    fi
fi

echo "🎬 Screened VCR Test Harness"
echo "Mode: $MODE"

case "$MODE" in
    mock)
        echo "Running in standard offline mock mode (fast, in-memory, zero API calls)..."
        PYTHONPATH=. "$PYTHON_BIN" -m pytest --disable-vcr "$@"
        ;;
    replay)
        echo "Running with VCR cassette replay enabled (SCREENED_VCR_ENABLED=1)..."
        SCREENED_VCR_ENABLED=1 PYTHONPATH=. "$PYTHON_BIN" -m pytest --use-vcr "$@"
        ;;
    record)
        echo "Running in VCR RECORD mode..."
        if [ -z "${GEMINI_API_KEY:-}" ] || [ "${GEMINI_API_KEY:-}" = "dummy-offline-key" ]; then
            echo "❌ ERROR: GEMINI_API_KEY must be set to a valid key to record live LLM traffic."
            echo "   Run: export GEMINI_API_KEY='your-key' before running record mode."
            exit 1
        fi
        SCREENED_VCR_ENABLED=1 PYTHONPATH=. "$PYTHON_BIN" -m pytest --use-vcr --record-mode=rewrite "$@"
        ;;
    help|--help|-h)
        echo "Usage: $0 [mock|replay|record] [extra pytest args...]"
        echo "  mock   - (Default) Run tests with in-memory offline mock"
        echo "  replay - Run tests with VCR cassette replay"
        echo "  record - Re-record live Gemini interactions to tests/cassettes/ (requires GEMINI_API_KEY)"
        ;;
    *)
        echo "Unknown mode: $MODE. Defaulting to mock mode..."
        PYTHONPATH=. "$PYTHON_BIN" -m pytest --disable-vcr "$MODE" "$@"
        ;;
esac
