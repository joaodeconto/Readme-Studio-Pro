#!/usr/bin/env bash
set -euo pipefail
FAIL=0

# Duplicatas de app roots
if git ls-files 'app/**/page.*' | grep -q . && git ls-files 'src/app/**/page.*' | grep -q .; then
  echo "❌ Duplicated app roots (app/ and src/app/)"; FAIL=1; fi

# PageProps/params sync
rg -n --glob '!node_modules' --glob '!*.d.ts' \
  'export default (async )?function Page\s*\(\s*\{?\s*params\s*:\s*\{' src/app app && { echo "❌ Pages com params síncrono"; FAIL=1; } || true

# RouteContext params sem await
rg -n 'ctx\.params\.' src/app app && { echo "❌ ctx.params usado sem await"; FAIL=1; } || true

# cookies()/headers() sem await
rg -n 'cookies\(\)\.(get|set|delete)' src app && { echo "❌ cookies() sem await"; FAIL=1; } || true
rg -n 'headers\(\)\.' src app && { echo "❌ headers() sem await"; FAIL=1; } || true

# Type-only imports (Toast exemplo)
rg -n "import\s*\{[^}]*\bToast\b[^}]*\}\s*from\s*'@ui/state/toast'" src app && { echo "❌ Toast import não-type"; FAIL=1; } || true

exit $FAIL
