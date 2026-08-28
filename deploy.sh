#!/usr/bin/env bash
set -eo pipefail

PROJECT_ID="screened-hackathon"
REGION="europe-west2"
SERVICE_NAME="screened"
SHORT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
IMAGE_TAG="europe-west2-docker.pkg.dev/${PROJECT_ID}/screened-app/screened:${SHORT_SHA}"

echo "=== 🚀 Deploying Screened to Google Cloud Run (${REGION}) ==="
echo "Commit: ${SHORT_SHA} | Build Time: ${BUILD_TIME}"

# 0. Generate version metadata for client cache invalidation
mkdir -p frontend/public frontend/dist
cat <<EOF > frontend/public/version.json
{
  "version": "0.1.0",
  "commitSha": "${SHORT_SHA}",
  "buildTime": "${BUILD_TIME}",
  "timestamp": $(date +%s%3N)
}
EOF
cp frontend/public/version.json frontend/dist/version.json 2>/dev/null || true

# 1. Ensure Artifact Registry repository exists
echo "Checking Artifact Registry repository..."
gcloud artifacts repositories describe screened-app --project="${PROJECT_ID}" --location="${REGION}" >/dev/null 2>&1 || \
gcloud artifacts repositories create screened-app \
  --project="${PROJECT_ID}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="Container repository for Screened app"

# 2. Build image via Cloud Build
echo "Building container image with Cloud Build..."
gcloud builds submit \
  --project="${PROJECT_ID}" \
  --substitutions=_COMMIT_SHA="${SHORT_SHA}" \
  --tag="${IMAGE_TAG}" .

# 3. Apply IAM Roles (Cloud Tasks Enqueuer & Observability / Telemetry)
echo "Ensuring required IAM roles are granted to compute service account..."
PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format="value(projectNumber)")
SA_EMAIL="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

REQUIRED_ROLES=(
  "roles/cloudtasks.enqueuer"
  "roles/cloudtrace.agent"
  "roles/logging.logWriter"
  "roles/errorreporting.writer"
  "roles/monitoring.metricWriter"
)

for ROLE in "${REQUIRED_ROLES[@]}"; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${ROLE}" >/dev/null 2>&1 || true
done

# 4. Deploy to Cloud Run
echo "Deploying container to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --image="${IMAGE_TAG}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=${PROJECT_ID},GOOGLE_CLOUD_LOCATION=${REGION},ENVIRONMENT=production,COMMIT_SHA=${SHORT_SHA},VITE_GA4_MEASUREMENT_ID=${VITE_GA4_MEASUREMENT_ID},TASK_QUEUE_NAME=${TASK_QUEUE_NAME}" \
  --set-secrets="PARALLEL_API_KEY=parallel-api-key:latest,SESSION_SIGNING_KEY=session-signing-key:latest,DIAGNOSTICS_TOKEN=diagnostics-token:latest,PARALLEL_WEBHOOK_SECRET=parallel-webhook-secret:latest" \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=5

URL=$(gcloud run services describe "${SERVICE_NAME}" --project="${PROJECT_ID}" --region="${REGION}" --format="value(status.url)")

echo "=== ✅ Deployed successfully! ==="
echo "Live URL: ${URL}"
