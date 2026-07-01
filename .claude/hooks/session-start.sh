#!/bin/bash
set -euo pipefail

# Only run in remote/web sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

echo "==> Installing dependencies..."
npm install

# Pin TypeScript to 5.5.4 to avoid tsconfig baseUrl deprecation errors
# from the environment's newer global TypeScript. See CLAUDE.md.
npm install --no-save typescript@5.5.4

echo "==> Setup complete. Versions:"
echo "    Node:    $(node -v)"
echo "    npm:     $(npm -v)"
echo "    tsc:     $(./node_modules/.bin/tsc -v)"
