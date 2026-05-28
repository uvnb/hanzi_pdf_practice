FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY alembic.ini .
COPY migrations ./migrations
COPY app ./app
COPY scripts ./scripts
COPY seed ./seed

CMD ["sh", "-c", "alembic upgrade head && python -m scripts.seed_hsk1 && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
