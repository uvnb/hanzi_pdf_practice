#!/bin/sh
set -eu

PORT="${PORT:-8000}"

echo "Starting Hanzi API on 0.0.0.0:${PORT}"
if [ -n "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is configured. Running migrations and seed data."
  alembic upgrade head
  python -m scripts.seed_hsk --refresh
else
  echo "DATABASE_URL is not configured. Skipping migrations and seed data."
  echo "Healthcheck will pass, but database-backed endpoints need DATABASE_URL."
  export AUTO_CREATE_TABLES=false
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}"
