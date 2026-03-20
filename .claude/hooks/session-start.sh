#!/bin/bash
set -euo pipefail

# Only run in remote Claude Code on the web environment
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
  echo "Installing dependencies with pnpm..."
  # Install pnpm if not available
  if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
  fi
  pnpm install
  echo "Dependencies installed."
else
  echo "No package.json found yet — skipping dependency install."
fi
