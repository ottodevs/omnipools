# OmniPools Development Makefile
# Simplified commands for modern Flow development

.PHONY: help install dev test test-coverage lint clean setup reset

# Default target
help:
	@echo "🚀 OmniPools Development Commands:"
	@echo ""
	@echo "📦 Quick Start:"
	@echo "  make setup      - Complete setup (emulator + contracts)"
	@echo "  make dev        - Start frontend"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test       - Run Flow tests with coverage"
	@echo "  make test-coverage - Run tests with detailed coverage report"
	@echo "  make lint       - Lint Cadence contracts"
	@echo ""
	@echo "🔄 Development:"
	@echo "  make install    - Install dependencies"
	@echo "  make flow       - Start Flow emulator"
	@echo "  make flow-stop  - Stop Flow emulator"
	@echo ""
	@echo "📋 Status:"
	@echo "  make status     - Check emulator and contract status"
	@echo "  make logs       - Show emulator logs"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make reset      - Reset emulator and redeploy"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	bun install
	@echo "✅ Dependencies installed"

# Setup Flow emulator and deploy contracts
setup: install
	@./scripts/start-emulator.sh
	@echo "📄 Deploying contracts..."
	@flow deploy --update || flow deploy
	@echo "✅ Setup complete! Emulator running and contracts deployed"

# Start Next.js development server
dev:
	@echo "🚀 Starting Next.js dev server..."
	bun run dev

# Start Flow emulator
flow:
	@./scripts/start-emulator.sh

# Stop Flow emulator
flow-stop:
	@./scripts/stop-emulator.sh

# Run Flow tests with coverage
test:
	@echo "🧪 Running Flow tests with coverage..."
	@flow test --cover
	@echo "✅ Tests completed"

# Run tests with detailed coverage report
test-coverage:
	@echo "🧪 Running Flow tests with detailed coverage..."
	@flow test --cover --coverprofile=coverage.json
	@echo "📊 Coverage report saved to coverage.json"
	@echo "✅ Tests completed"

# Lint Cadence contracts
lint:
	@echo "🔍 Linting Cadence contracts..."
	@flow cadence lint cadence/contracts/*.cdc
	@echo "✅ Contract linting passed"

# Check emulator and contract status
status:
	@echo "📊 Flow Emulator Status:"
	@if nc -z localhost 3569 2>/dev/null; then \
		echo "✅ Emulator is running"; \
		echo "🌐 REST API: http://localhost:8888"; \
		echo "⚙️ Admin API: http://localhost:8080"; \
	else \
		echo "❌ Emulator not running"; \
		echo "💡 Run 'make flow' to start emulator"; \
	fi
	@echo ""
	@echo "📄 Contract Addresses:"
	@flow accounts get emulator-account 2>/dev/null || echo "⚠️  No contracts deployed yet"

# Show emulator logs
logs:
	@echo "📋 Emulator logs:"
	@tail -f flowdb/emulator.log

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf .next
	rm -rf node_modules/.cache
	rm -f coverage.json
	@echo "✅ Clean complete"

# Reset emulator and redeploy
reset:
	@echo "🔄 Resetting emulator state and redeploying contracts..."
	@./scripts/stop-emulator.sh
	@rm -rf flowdb
	@echo "🧹 Cleared emulator database"
	@./scripts/start-emulator.sh
	@echo "📄 Deploying contracts..."
	@flow deploy
	@echo "✅ Reset complete! Fresh emulator state with contracts deployed" 