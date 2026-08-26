# Multi-stage production build for Screened

# Stage 1: Build Vite React Frontend
FROM node:22-alpine AS frontend-builder
ARG COMMIT_SHA=dev
ARG BUILD_TIME=""
ARG APP_VERSION="0.1.0"
ENV COMMIT_SHA=${COMMIT_SHA}
ENV BUILD_TIME=${BUILD_TIME}
ENV APP_VERSION=${APP_VERSION}
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Python FastAPI Backend + Bundled Static Frontend
FROM python:3.11-slim AS runner
ARG COMMIT_SHA=dev
ARG BUILD_TIME=""
ARG APP_VERSION="0.1.0"

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    COMMIT_SHA=${COMMIT_SHA} \
    BUILD_TIME=${BUILD_TIME} \
    APP_VERSION=${APP_VERSION} \
    PORT=8080

# Install build essentials if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend/ ./backend/

# Copy compiled frontend from builder
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port (Cloud Run sets PORT env var)
EXPOSE 8080

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
