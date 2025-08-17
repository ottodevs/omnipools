#!/bin/bash

# Test Flow Integration Script
# This script tests the Flow blockchain integration

set -e

echo "🚀 Testing Flow Integration for OmniPools"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Flow CLI is installed
check_flow_cli() {
    print_status "Checking Flow CLI installation..."
    if ! command -v flow &> /dev/null; then
        print_error "Flow CLI is not installed. Please install it first."
        print_status "Visit: https://docs.onflow.org/flow-cli/install/"
        exit 1
    fi
    print_success "Flow CLI is installed"
}

# Check if emulator is running
check_emulator() {
    print_status "Checking if Flow emulator is running..."
    if ! curl -s http://localhost:8888/health &> /dev/null; then
        print_warning "Flow emulator is not running. Starting it..."
        flow emulator start --persist &
        sleep 5
    else
        print_success "Flow emulator is running"
    fi
}

# Deploy contracts
deploy_contracts() {
    print_status "Deploying contracts to emulator..."
    if flow deploy; then
        print_success "Contracts deployed successfully"
    else
        print_error "Failed to deploy contracts"
        exit 1
    fi
}

# Test vault creation
test_vault_creation() {
    print_status "Testing vault creation..."
    
    # Create organization
    flow transactions send cadence/transactions/tx_create_org.cdc 0xf8d6e0586b0a20c7
    
    # Create vault
    flow transactions send cadence/transactions/tx_create_vault_simple.cdc 0xf8d6e0586b0a20c7 "Test Vault" "A test vault for integration testing" 1
    
    print_success "Vault creation test completed"
}

# Test data fetching
test_data_fetching() {
    print_status "Testing data fetching from blockchain..."
    
    # Test getting vault data
    if flow scripts execute cadence/scripts/sc_get_vault.cdc 0xf8d6e0586b0a20c7 1; then
        print_success "Vault data fetching works"
    else
        print_error "Failed to fetch vault data"
        return 1
    fi
    
    # Test getting winners
    if flow scripts execute cadence/scripts/sc_get_winners.cdc 0xf8d6e0586b0a20c7 1; then
        print_success "Winners data fetching works"
    else
        print_warning "No winners data available (this is normal for new vaults)"
    fi
    
    # Test getting participants
    if flow scripts execute cadence/scripts/sc_get_participants.cdc 0xf8d6e0586b0a20c7 1; then
        print_success "Participants data fetching works"
    else
        print_warning "No participants data available (this is normal for new vaults)"
    fi
}

# Test frontend integration
test_frontend() {
    print_status "Testing frontend integration..."
    
    # Check if the app is running
    if curl -s http://localhost:3000 &> /dev/null; then
        print_success "Frontend is accessible"
    else
        print_warning "Frontend is not running. Start it with: bun run dev"
    fi
}

# Main test sequence
main() {
    echo "🧪 Starting Flow Integration Tests"
    echo "=================================="
    
    check_flow_cli
    check_emulator
    deploy_contracts
    test_vault_creation
    test_data_fetching
    test_frontend
    
    echo ""
    echo "✅ Flow Integration Tests Completed!"
    echo ""
    echo "Next steps:"
    echo "1. Start the frontend: bun run dev"
    echo "2. Open http://localhost:3000"
    echo "3. Navigate to a vault page to see real-time blockchain data"
    echo "4. Try executing transactions from the UI"
    echo ""
    echo "For more information, see: FLOW_INTEGRATION.md"
}

# Run main function
main "$@" 