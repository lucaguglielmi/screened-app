#!/usr/bin/env bash
set -e

# Start FastAPI backend
echo ">> Starting Screened FastAPI Backend on http://localhost:8000..."
PYTHONPATH=. .venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
