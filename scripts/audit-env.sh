#!/usr/bin/env bash
#
# audit-env.sh — verify .env.example covers every process.env.* used in src/.
#                Catches drift before deploy when devs add a new env var
#                and forget to document it.
#
# Usage:
#   ./scripts/audit-env.sh           # report missing keys (exit 1 if any)
#   ./scripts/audit-env.sh --fix     # append missing keys to .env.example
#
# CI hook: add to .github/workflows/security.yml as a step.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXAMPLE="$ROOT/.env.example"
FIX_MODE="${1:-}"

if [[ ! -f "$EXAMPLE" ]]; then
  echo "FAIL: .env.example missing at $EXAMPLE"
  exit 2
fi

# Built-in keys Next.js / Node provide automatically — not user config.
BUILTIN_RE='^(NODE_ENV|VERCEL|VERCEL_ENV|VERCEL_URL|VERCEL_REGION|CI|PORT|TZ|PWD|HOME|PATH)$'

# Extract every process.env.IDENT in src/
USED_KEYS=$(
  grep -rhE "process\.env\.[A-Z][A-Z0-9_]*" "$ROOT/src" 2>/dev/null \
    | grep -oE "process\.env\.[A-Z][A-Z0-9_]*" \
    | sed 's/process\.env\.//' \
    | sort -u \
    | grep -vE "$BUILTIN_RE" || true
)

# Extract documented keys
DOCUMENTED=$(
  grep -E "^[A-Z][A-Z0-9_]*=" "$EXAMPLE" \
    | sed 's/=.*//' \
    | sort -u
)

# Diff
MISSING=$(comm -23 <(echo "$USED_KEYS") <(echo "$DOCUMENTED") || true)

if [[ -z "$MISSING" ]]; then
  echo "✓ .env.example covers every key used in src/"
  exit 0
fi

echo "✗ .env.example is missing $(echo "$MISSING" | wc -l | tr -d ' ') key(s):"
echo "$MISSING" | sed 's/^/  - /'

if [[ "$FIX_MODE" == "--fix" ]]; then
  {
    echo ""
    echo "# ─── Auto-added by audit-env.sh on $(date +%Y-%m-%d) ──────────────────────"
    while IFS= read -r key; do
      echo "$key="
    done <<< "$MISSING"
  } >> "$EXAMPLE"
  echo ""
  echo "✓ Appended to $EXAMPLE — review + add comments + commit."
  exit 0
fi

echo ""
echo "Run with --fix to append placeholders, or document them manually."
exit 1
