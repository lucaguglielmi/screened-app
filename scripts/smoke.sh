#!/usr/bin/env bash
set -e

BASE_URL="${1:-http://127.0.0.1:8000}"

echo "========================================================"
echo " Running Screened Smoke Tests against: ${BASE_URL}"
echo "========================================================"

echo ""
echo "[1/2] Testing /healthz endpoint..."
HEALTH_RESP=$(curl -s -f "${BASE_URL}/healthz")
echo "Health Response: ${HEALTH_RESP}"

echo ""
echo "[2/2] Testing /api/test-pipeline with Parallel Search..."
PIPELINE_RESP=$(curl -s -f -X POST "${BASE_URL}/api/test-pipeline" \
  -H "Content-Type: application/json" \
  ${DIAGNOSTICS_TOKEN:+-H "Authorization: Bearer ${DIAGNOSTICS_TOKEN}"} \
  -d '{"festivalName": "Aldergate Film Festival"}')

SOURCES_FOUND=$(echo "${PIPELINE_RESP}" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('sourcesFound', 0))")
CLAIMS_COUNT=$(echo "${PIPELINE_RESP}" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('extractedClaims', [])))")
LATENCY=$(echo "${PIPELINE_RESP}" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('durationSeconds', 0))")

echo ">> Sources Discovered via Parallel: ${SOURCES_FOUND}"
echo ">> Verified Atomic Claims: ${CLAIMS_COUNT}"
echo ">> Total Roundtrip Latency: ${LATENCY}s"

if [ "${SOURCES_FOUND}" -gt 0 ]; then
  echo ""
  echo "✅ Smoke tests passed successfully!"
  exit 0
else
  echo ""
  echo "❌ Smoke test failed: No sources returned."
  exit 1
fi
