#!/usr/bin/env bash
set -euo pipefail

echo "🔄 Resetting environment and running demo..."

# Kill any existing emulator
pkill -f "flow emulator" || true
sleep 1

# Clean cache
rm -rf .cache || true
mkdir -p .cache

# Start emulator in background
echo "🚀 Starting Flow emulator..."
flow emulator start --verbose &
sleep 2

# Run demo
echo "🎯 Running demo..."
./scripts/demo.sh

# Refresh UI data
echo "📊 Refreshing UI data..."
bun run snapshot-ui

# Start UI
echo "🌐 Starting UI..."
bun run dev

echo "✅ Demo ready! Open http://localhost:3000/vault/1" 