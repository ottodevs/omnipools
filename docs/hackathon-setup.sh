#!/bin/bash

# OmniPools Hackathon Setup Script
# Multi-terminal setup for ETHGlobal New York 2025

set -e

echo "🚀 OmniPools Hackathon Setup"
echo "=============================="

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v bun &> /dev/null; then
    echo "❌ Bun not found. Install from https://bun.sh/"
    exit 1
fi

if ! command -v flow &> /dev/null; then
    echo "❌ Flow CLI not found. Install from https://developers.flow.com/tools/flow-cli"
    exit 1
fi

echo "✅ Prerequisites met"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

echo ""
echo "🎉 Setup Instructions"
echo "===================="
echo ""
echo "🔧 Terminal 1 (Flow Emulator):"
echo "   make flow"
echo ""
echo "🔧 Terminal 2 (Contract Deployment):"
echo "   make setup"
echo ""
echo "🔧 Terminal 3 (Frontend):"
echo "   make dev"
echo ""
echo "🔗 URLs:"
echo "   📱 Next.js: http://localhost:3000"
echo "   🔧 Flow Emulator: http://localhost:3569"
echo ""
echo "📚 Documentation:"
echo "   📖 Main Guide: docs/README.md"
echo "   🗽 Hackathon Guide: docs/HACKATHON.md"
echo "   🛠️ Development Guide: docs/DEVELOPMENT.md"
echo ""
echo "💡 Happy hacking! 🗽" 