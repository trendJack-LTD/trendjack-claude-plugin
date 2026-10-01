#!/usr/bin/env bash
# Runs claude plugin validate --strict on the marketplace and each plugin.
# The marketplace has no version of its own, so its missing-version warning is the one warning allowed.
set -uo pipefail
cd "$(dirname "$0")/.."

ALLOWED='No version specified'
status=0

check() {
  local target="$1" allow="$2" out
  if out=$(claude plugin validate --strict "$target" 2>&1); then
    echo "✔ $target"
    return
  fi
  local other
  other=$(printf '%s\n' "$out" | grep '❯' | { if [ "$allow" = yes ]; then grep -v "$ALLOWED"; else cat; fi; })
  if [ -z "$other" ] && printf '%s\n' "$out" | grep -q 'treats warnings as errors'; then
    echo "✔ $target (allowed: $ALLOWED)"
  else
    printf '%s\n' "$out"
    status=1
  fi
}

check . yes
for manifest in plugins/*/.claude-plugin/plugin.json; do
  check "./$manifest" no
done
exit $status
