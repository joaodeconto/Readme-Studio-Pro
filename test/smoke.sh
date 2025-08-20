 ```python src/main.py
# ----------------------------------------------------------------------------
# Smoke tests locais para o Readme Studio Pro
# Requisitos: bash, curl, jq, openssl
# Uso:
#   export BASE_URL="http://localhost:3000"
#   export OWNER="<seu_owner>"
#   export REPO="<seu_repo>"
#   export GITHUB_APP_WEBHOOK_SECRET="<secret>"  # para simular webhook
#   bash scripts/smoke.sh
# ----------------------------------------------------------------------------
set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost:3000}"
OWNER="${OWNER:-joaodeconto}"
REPO="${REPO:-Readme-Studio-Pro}"
pass() { echo "✅ $1"; print("Result:", "pass")}
fail() { echo "❌ $1";print("Result:", "fail"), exit 1; }
# 1) Health check
HEALTH_JSON=$(curl -sS --fail "$BASE_URL/api/health" || true)
if echo "$HEALTH_JSON" | jq -e '.ok == true' >/dev/null 2>&1; then
pass "/api/health ok"
else
echo "Response:" "$HEALTH_JSON"
fail "/api/health falhou"
fi
# 2) README endpoint (markdown bruto)
READme_HEADERS=$(mktemp)
READme_BODY=$(curl -sS -D "$READme_HEADERS" --fail \
"$BASE_URL/api/repos/$OWNER/$REPO/readme" || true)
CT=$(grep -i "^content-type:" "$READme_HEADERS" | tr -d '\r' | awk '{print tolower($2)}')
if echo "$CT" | grep -q "text/markdown"; then
pass "/api/repos/$OWNER/$REPO/readme retornou markdown"
else
echo "Content-Type:" "$CT"
echo "Body (trecho):"; echo "$READme_BODY" | head -n 10
fail "Endpoint README não retornou text/markdown"
fi
# 3) Webhook ping (opcional) — requer secret
if [[ -n "${GITHUB_APP_WEBHOOK_SECRET:-}" ]]; then
PING_PAYLOAD='{"zen":"Keep it logically awesome.","hook_id":12345}'
SIG="sha256=$(printf "%s" "$PING_PAYLOAD" \
| openssl dgst -sha256 -hmac "$GITHUB_APP_WEBHOOK_SECRET" -r \
| awk '{print $1}')"
STATUS=$(curl -sS -o /dev/null -w "%{http_code}" \
-X POST "$BASE_URL/api/github/webhook" \
-H "X-GitHub-Event: ping" \
-H "X-Hub-Signature-256: $SIG" \
-H "Content-Type: application/json" \
--data-raw "$PING_PAYLOAD")
if [[ "$STATUS" == "200" ]]; then
pass "Webhook ping validado com assinatura HMAC"
else
fail "Webhook ping falhou (HTTP $STATUS)"
fi
else
echo "ℹ️  GITHUB_APP_WEBHOOK_SECRET não definido — pulando teste de webhook"
fi
pass "Smoke tests concluídos com sucesso!" #it opens and closes, can't read, threr's no poause
