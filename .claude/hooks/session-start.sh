#!/bin/bash
set -euo pipefail

# Only run in remote/web Claude Code sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

echo "=== AllOdds session setup ==="

# Install dependencies if node_modules is absent or stale
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
  echo "Installing npm dependencies..."
  npm install
fi

# Pin TypeScript to the project-pinned version to avoid tsc tsconfig baseUrl deprecation warnings
if ! node -e "process.exit(require('./node_modules/typescript/package.json').version === '5.5.4' ? 0 : 1)" 2>/dev/null; then
  echo "Pinning typescript@5.5.4..."
  npm install --no-save typescript@5.5.4
fi

echo ""
echo "=== Verify commands ==="
echo "  npm run lint    # tsc --noEmit (type-check)"
echo "  npm run build   # tsc && vite build"
# If a test script has been added (e.g. by PR #35/#18), surface it too
if node -e "process.exit(require('./package.json').scripts?.test ? 0 : 1)" 2>/dev/null; then
  echo "  npm run test    # vitest run"
  echo "  npm run verify  # lint + test + build"
fi
echo "==========================="
