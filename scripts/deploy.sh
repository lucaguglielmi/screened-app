#!/usr/bin/env bash
set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-screened-hackathon}"
REGION="${GOOGLE_CLOUD_LOCATION:-europe-west2}"
SERVICE_NAME="screened"

echo "========================================================"
echo " Deploying Screened to Cloud Run"
echo " Project: ${PROJECT_ID} | Region: ${REGION}"
echo "========================================================"

# Step 1: Build Frontend Assets
echo ">> Building frontend SPA..."
cd frontend && npm run build && cd ..

# Step 2: Deploy to Cloud Run
echo ">> Deploying container to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_GENAI_USE_VERTEXAI=TRUE,GOOGLE_CLOUD_PROJECT="${PROJECT_ID}",GOOGLE_CLOUD_LOCATION="${REGION}" \
  --set-secrets PARALLEL_API_KEY=parallel-api-key:latest,SESSION_SIGNING_KEY=session-signing-key:latest,DIAGNOSTICS_TOKEN=diagnostics-token:latest,PARALLEL_WEBHOOK_SECRET=parallel-webhook-secret:latest \
  --no-cpu-throttling \
  --min-instances 1 \
  --max-instances 3 \
  --concurrency 20 \
  --timeout 300 \
  --memory 1Gi

echo ">> Deployment complete!"
