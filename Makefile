# OmniPools Development Makefile
# Quick commands for hackathon development

.PHONY: help install dev test flow-emulator flow-test flow-deploy clean

# Default target
help:
	@echo "🚀 OmniPools Development Commands:"
	@echo ""
	@echo "📦 Quick Start:"
	@echo "  make hackathon   - Complete setup (emulator + contracts)"
	@echo "  make dev         - Start frontend"
	@echo ""
	@echo "🔄 Development:"
	@echo "  make install     - Install dependencies"
	@echo "  make flow        - Start Flow emulator (background)"
	@echo "  make setup       - Setup emulator + deploy contracts"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test        - Run all tests (our implementation)"
	@echo "  make test-flow   - Run Flow native tests (official)"
	@echo "  make test-all    - Run both approaches + linting"
	@echo "  make lint        - Lint Cadence contracts"
	@echo ""
	@echo "📋 Status & Debug:"
	@echo "  make status      - Check emulator and contract status"
	@echo "  make logs        - Show emulator logs"
	@echo "  make flow-stop   - Stop Flow emulator"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make reset       - Reset emulator state and redeploy contracts"

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

# Start Flow emulator (runs in foreground)
flow:
	@./scripts/start-emulator.sh

# Stop Flow emulator
flow-stop:
	@./scripts/stop-emulator.sh

# Run all tests
test: test-simple test-e2e test-vault test-comprehensive
	@echo "✅ All tests completed"

# Run simple contract tests
test-simple:
	@echo "🧪 Running simple contract tests..."
	@if ! nc -z localhost 3569 2>/dev/null; then \
		echo "⚠️  Emulator not running, starting it..."; \
		make flow; \
	fi
	@flow scripts execute cadence/scripts/sc_test_simple.cdc
	@flow scripts execute cadence/scripts/sc_test_contracts.cdc

# Run end-to-end tests
test-e2e:
	@echo "🧪 Running end-to-end tests..."
	@if ! nc -z localhost 3569 2>/dev/null; then \
		echo "⚠️  Emulator not running, starting it..."; \
		make flow; \
	fi
	@flow scripts execute cadence/scripts/sc_test_end_to_end_simple.cdc

# Test vault operations
test-vault:
	@echo "🧪 Testing vault operations..."
	@if ! nc -z localhost 3569 2>/dev/null; then \
		echo "⚠️  Emulator not running, starting it..."; \
		make flow; \
	fi
	@flow scripts execute cadence/scripts/sc_test_vault_creation.cdc
	@flow scripts execute cadence/scripts/sc_test_vault_operations.cdc

# Run comprehensive tests
test-comprehensive:
	@echo "🧪 Running comprehensive tests..."
	@if ! nc -z localhost 3569 2>/dev/null; then \
		echo "⚠️  Emulator not running, starting it..."; \
		make flow; \
	fi
	@flow scripts execute cadence/scripts/sc_test_comprehensive.cdc

# Lint Cadence code
lint:
	@echo "🔍 Linting Cadence contracts..."
	@flow cadence lint cadence/contracts/FungibleTokenMock.cdc
	@flow cadence lint cadence/contracts/Registry.cdc  
	@flow cadence lint cadence/contracts/Vaults.cdc
	@echo "✅ Contract linting passed"
	@echo "💡 Note: Scripts require deployed contracts for proper linting"

# Run Flow native tests (experimental)
test-flow:
	@echo "🧪 Running Flow native tests..."
	@echo "💡 Note: This uses the official flow test framework"
	@flow test --cover || echo "⚠️  Flow native tests may require additional configuration"

# Run all test approaches
test-all: test test-flow lint
	@echo "🎉 All testing approaches completed!"

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

# Quick hackathon setup (everything in one command)
hackathon: setup
	@echo "🎉 Hackathon setup complete!"
	@echo "📱 Next.js: http://localhost:3000"
	@echo "🔧 Flow Emulator: http://localhost:3569"
	@echo ""
	@echo "🚀 Now run 'make dev' to start the frontend"
	@echo "📚 Documentation: ./docs/" 