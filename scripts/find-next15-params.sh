#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
if [ -d src ]; then
  cd src
fi

if rg -n --glob '!node_modules' --glob 'app/**/page.tsx' 'export default (async )?function Page\s*\(\s*\{?\s*params\s*:'; then
  echo
  echo "Found page components with synchronous params. Refactor for Next.js 15."
  exit 1
fi
