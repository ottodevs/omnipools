#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE="$ROOT/.cache"
PUB="$ROOT/public/data"

mkdir -p "$PUB"

# Normalize Flow CLI outputs (strip "Result:" prefix if present)
normalize() {
  local in="$1" out="$2"
  if grep -q '^Result:' "$in"; then
    sed 's/^Result: //' "$in" > "$out"
  else
    cp "$in" "$out"
  fi
}

normalize "$CACHE/summary_after.json" "$PUB/summary_after.json"

# Compose vault-1.json from summary + a winners snapshot (edit if your path differs)
# If you already have winners fixed in demo.sh, keep them here as a single source of truth.
cat > "$PUB/vault-1.json" <<'JSON'
{
  "vaultId": 1,
  "org": "0xf8d6e0586b0a20c7",
  "name": "Demo Bounties Pool",
  "description": "Top bounties paid via Flow Actions.",
  "status": "Paid",
  "lastOperationId": 1,
  "totalPaid": "5000.00",
  "misses": {},
  "winners": [
    { "address": "0x179b6b1cb6755e31", "amount": "3000.00" },
    { "address": "0xf3fcd2c1a78f5eee", "amount": "2000.00" }
  ]
}
JSON

echo "Wrote: $PUB/summary_after.json, $PUB/vault-1.json" 