#!/usr/bin/env bash
set -e

BASE_URL="${1:-http://127.0.0.1:8000}"

echo "========================================================"
echo " Running Screened Smoke Tests against: ${BASE_URL}"
echo "========================================================"

echo ""
echo "[1/4] Testing /healthz endpoint..."
HEALTH_RESP=$(curl -s -f "${BASE_URL}/healthz")
echo "Health Response: ${HEALTH_RESP}"

echo ""
echo "[2/4] Testing POST /api/investigations (Demo Mode Interception)..."
DEMO_POST_RESP=$(curl -s -f -X POST "${BASE_URL}/api/investigations" \
  -H "Content-Type: application/json" \
  -d '{"query": "demo"}')
DEMO_ID=$(echo "${DEMO_POST_RESP}" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', ''))")
echo "Demo Investigation ID: ${DEMO_ID}"
if [ "${DEMO_ID}" != "demo_pinco_pallino" ]; then
  echo "❌ POST demo failed: expected demo_pinco_pallino, got '${DEMO_ID}'"
  exit 1
fi

echo ""
echo "[3/4] Testing GET /api/investigations/demo_pinco_pallino..."
DEMO_GET_RESP=$(curl -s -f "${BASE_URL}/api/investigations/demo_pinco_pallino")
STATUS=$(echo "${DEMO_GET_RESP}" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('status', ''))")
SCORE=$(echo "${DEMO_GET_RESP}" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('deepVetting', {}).get('overallAuthenticityScore', ''))")
echo "Dossier Status: ${STATUS}, Authenticity Score: ${SCORE}"
if [ "${STATUS}" != "READY" ]; then
  echo "❌ GET demo failed: status is not READY"
  exit 1
fi

echo ""
echo "[4/4] Testing GET /api/investigations/demo_pinco_pallino/events (SSE Stream)..."
SSE_FIRST_EVENT=$(curl -s -N --max-time 3 "${BASE_URL}/api/investigations/demo_pinco_pallino/events" | head -n 2)
echo "SSE Header/Event: ${SSE_FIRST_EVENT}"
if ! echo "${SSE_FIRST_EVENT}" | grep -q "data:"; then
  echo "❌ SSE stream failed: did not receive event data"
  exit 1
fi

echo ""
echo "✅ All Screened smoke tests passed successfully!"
exit 0
