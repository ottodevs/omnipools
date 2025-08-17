#!/usr/bin/env bash
set -euo pipefail

# Testnet Demo Script with FlowScan Integration
# This script runs the complete OmniPools flow on Flow testnet and provides FlowScan links

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
NETWORK="testnet"
DEPLOYER_ACCOUNT="deployer"
ORG_ADDRESS="0x035662afa58bdc22"  # Deployer account serves as org for demo
VAULT_ID=1

# FlowScan base URL
FLOWSCAN_BASE="https://testnet.flowscan.org"

# Arrays to store transaction details
declare -a TX_IDS=()
declare -a TX_DESCRIPTIONS=()

# Function to print colored output
print_header() {
    echo -e "\n${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}\n"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
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

print_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Function to execute transaction and capture ID
execute_transaction() {
    local tx_file="$1"
    local description="$2"
    shift 2
    local args=("$@")
    
    print_step "Executing: $description"
    
    # Build the flow command
    local cmd="flow transactions send $tx_file --network $NETWORK --signer $DEPLOYER_ACCOUNT"
    
    # Add arguments if provided
    if [ ${#args[@]} -gt 0 ]; then
        for arg in "${args[@]}"; do
            cmd="$cmd $arg"
        done
    fi
    
    print_info "Command: $cmd"
    
    # Execute and capture output
    local output
    if output=$(eval "$cmd" 2>&1); then
        # Extract transaction ID from output
        local tx_id
        if tx_id=$(echo "$output" | grep -o "0x[a-fA-F0-9]\{64\}" | head -1); then
            TX_IDS+=("$tx_id")
            TX_DESCRIPTIONS+=("$description")
            print_success "Transaction successful: $tx_id"
            print_info "FlowScan: ${FLOWSCAN_BASE}/transaction/${tx_id}"
            echo ""
        else
            print_warning "Transaction completed but could not extract ID"
            print_info "Output: $output"
            TX_IDS+=("unknown")
            TX_DESCRIPTIONS+=("$description")
        fi
    else
        print_error "Transaction failed: $description"
        print_error "Output: $output"
        return 1
    fi
}

# Function to execute script and show result
execute_script() {
    local script_file="$1"
    local description="$2"
    shift 2
    local args=("$@")
    
    print_step "Executing script: $description"
    
    # Build the flow command
    local cmd="flow scripts execute $script_file --network $NETWORK"
    
    # Add arguments if provided
    if [ ${#args[@]} -gt 0 ]; then
        for arg in "${args[@]}"; do
            cmd="$cmd $arg"
        done
    fi
    
    print_info "Command: $cmd"
    
    # Execute and show output
    if output=$(eval "$cmd" 2>&1); then
        print_success "Script executed successfully"
        echo "$output" | jq . 2>/dev/null || echo "$output"
        echo ""
    else
        print_error "Script failed: $description"
        print_error "Output: $output"
        return 1
    fi
}

# Function to generate FlowScan summary
generate_flowscan_summary() {
    print_header "FLOWSCAN TRANSACTION SUMMARY"
    
    echo "Total transactions executed: ${#TX_IDS[@]}"
    echo ""
    
    for i in "${!TX_IDS[@]}"; do
        local tx_id="${TX_IDS[$i]}"
        local description="${TX_DESCRIPTIONS[$i]}"
        
        printf "%2d. %s\n" $((i+1)) "$description"
        if [ "$tx_id" != "unknown" ]; then
            printf "    Transaction ID: %s\n" "$tx_id"
            printf "    FlowScan Link:  %s/transaction/%s\n" "$FLOWSCAN_BASE" "$tx_id"
        else
            printf "    Transaction ID: Could not capture\n"
        fi
        echo ""
    done
    
    # Generate account links
    echo "ACCOUNT LINKS:"
    echo "Deployer/Org Account: ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}"
    echo ""
    
    # Generate contract links
    echo "CONTRACT LINKS:"
    echo "Registry:     ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}/contract/Registry"
    echo "Vaults:       ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}/contract/Vaults"
    echo "MockUSDC:     ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}/contract/MockUSDC"
    echo "DeFiActions:  ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}/contract/DeFiActions"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    print_header "CHECKING PREREQUISITES"
    
    # Check Flow CLI
    if ! command -v flow &> /dev/null; then
        print_error "Flow CLI is not installed"
        exit 1
    fi
    print_success "Flow CLI is available"
    
    # Check network connectivity
    if ! curl -s --connect-timeout 5 "https://access.devnet.nodes.onflow.org:9000" > /dev/null; then
        print_error "Cannot connect to Flow testnet"
        exit 1
    fi
    print_success "Flow testnet is accessible"
    
    # Check if deployer account is configured
    if ! flow accounts get "$DEPLOYER_ACCOUNT" --network "$NETWORK" > /dev/null 2>&1; then
        print_error "Deployer account not properly configured for testnet"
        print_info "Please ensure the deployer account is set up in flow.json"
        exit 1
    fi
    print_success "Deployer account is configured"
    
    echo ""
}

# Function to check contract deployment status
check_contracts() {
    print_header "CHECKING CONTRACT DEPLOYMENT"
    
    local contracts=("Registry" "Vaults" "MockUSDC" "DeFiActions")
    
    for contract in "${contracts[@]}"; do
        print_step "Checking $contract deployment..."
        if flow accounts get "$ORG_ADDRESS" --network "$NETWORK" | grep -q "$contract"; then
            print_success "$contract is deployed"
        else
            print_warning "$contract may not be deployed"
        fi
    done
    
    echo ""
}

# Main demo flow
run_demo_flow() {
    print_header "STARTING OMNIPOOLS TESTNET DEMO"
    
    # 1. Create organization (if not exists)
    print_step "Step 1: Create Organization"
    execute_transaction \
        "./cadence/transactions/tx_create_org.cdc" \
        "Create OmniPool Labs organization" \
        "\"OmniPool Labs\""
    
    # 2. Create vault
    print_step "Step 2: Create Demo Vault"
    execute_transaction \
        "./cadence/transactions/tx_create_vault.cdc" \
        "Create ETHGlobal NY Bounties vault" \
        "--args-json" \
        "'[{\"type\": \"Address\", \"value\": \"'$ORG_ADDRESS'\"}, {\"type\": \"String\", \"value\": \"ETHGlobal NY Bounties\"}, {\"type\": \"UInt8\", \"value\": \"0\"}, {\"type\": \"String\", \"value\": \"Top bounties paid via Flow Actions.\"}, {\"type\": \"Optional\", \"value\": null}, {\"type\": \"Optional\", \"value\": null}, {\"type\": \"Optional\", \"value\": null}, {\"type\": \"Array\", \"value\": [{\"type\": \"String\", \"value\": \"usdc:flow\"}]}, {\"type\": \"Array\", \"value\": [{\"type\": \"String\", \"value\": \"usdc:flow\"}]}, {\"type\": \"Optional\", \"value\": null}, {\"type\": \"Optional\", \"value\": null}]'"
    
    # 3. Setup USDC receiver
    print_step "Step 3: Setup USDC Receiver"
    execute_transaction \
        "./cadence/transactions/tx_link_usdc_receiver.cdc" \
        "Link USDC receiver capability"
    
    # 4. Add participants
    print_step "Step 4: Add Participants"
    execute_transaction \
        "./cadence/transactions/tx_add_participant.cdc" \
        "Add participant TeamAlpha" \
        "$ORG_ADDRESS" "$VAULT_ID" "$ORG_ADDRESS" "\"{\\\"team\\\":\\\"TeamAlpha\\\"}\""
    
    execute_transaction \
        "./cadence/transactions/tx_add_participant.cdc" \
        "Add participant TeamBeta" \
        "$ORG_ADDRESS" "$VAULT_ID" "$ORG_ADDRESS" "\"{\\\"team\\\":\\\"TeamBeta\\\"}\""
    
    # 5. Setup USDC minter
    print_step "Step 5: Setup USDC Minter"
    execute_transaction \
        "./cadence/transactions/tx_setup_minter.cdc" \
        "Setup MockUSDC minter capability"
    
    # 6. Fund with USDC
    print_step "Step 6: Fund Organization with USDC"
    execute_transaction \
        "./cadence/transactions/tx_mint_or_fund_usdc.cdc" \
        "Mint 5000 USDC to organization" \
        "$ORG_ADDRESS" "\"5000.00\""
    
    # 7. Set winners and plan payout
    print_step "Step 7: Set Winners and Plan Payout"
    execute_transaction \
        "./cadence/transactions/tx_set_winners_simple.cdc" \
        "Set winners with prize distribution" \
        "$ORG_ADDRESS" "$VAULT_ID" "1" "3000.00" "2" "2000.00"
    
    execute_transaction \
        "./cadence/transactions/tx_plan_payout.cdc" \
        "Plan payout execution" \
        "$ORG_ADDRESS" "$VAULT_ID"
    
    # 8. Execute payout
    print_step "Step 8: Execute Payout with Flow Actions"
    execute_transaction \
        "./cadence/transactions/tx_payout_split.cdc" \
        "Execute payout via Flow Actions" \
        "$ORG_ADDRESS" "$VAULT_ID"
    
    print_success "Demo flow completed successfully!"
}

# Function to check final state
check_final_state() {
    print_header "CHECKING FINAL STATE"
    
    # Get vault summary
    execute_script \
        "./cadence/scripts/sc_get_summary.cdc" \
        "Get vault summary after payout" \
        "$ORG_ADDRESS" "$VAULT_ID"
    
    # Get winner balances
    execute_script \
        "./cadence/scripts/sc_get_winner_balance.cdc" \
        "Get winner balance for account" \
        "$ORG_ADDRESS"
    
    # Get participants
    execute_script \
        "./cadence/scripts/sc_get_participants.cdc" \
        "Get vault participants" \
        "$ORG_ADDRESS" "$VAULT_ID"
    
    # Get winners
    execute_script \
        "./cadence/scripts/sc_get_winners.cdc" \
        "Get vault winners" \
        "$ORG_ADDRESS" "$VAULT_ID"
}

# Function to save results
save_results() {
    print_header "SAVING RESULTS"
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local results_file="testnet_demo_results_${timestamp}.json"
    
    # Create results JSON
    cat > "$results_file" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "network": "$NETWORK",
  "org_address": "$ORG_ADDRESS",
  "vault_id": $VAULT_ID,
  "flowscan_base": "$FLOWSCAN_BASE",
  "transactions": [
EOF

    for i in "${!TX_IDS[@]}"; do
        local tx_id="${TX_IDS[$i]}"
        local description="${TX_DESCRIPTIONS[$i]}"
        
        if [ $i -gt 0 ]; then echo "," >> "$results_file"; fi
        cat >> "$results_file" << EOF
    {
      "step": $((i+1)),
      "description": "$description",
      "transaction_id": "$tx_id",
      "flowscan_url": "$FLOWSCAN_BASE/transaction/$tx_id"
    }
EOF
    done
    
    cat >> "$results_file" << EOF
  ],
  "links": {
    "org_account": "$FLOWSCAN_BASE/account/$ORG_ADDRESS",
    "contracts": {
      "Registry": "$FLOWSCAN_BASE/account/$ORG_ADDRESS/contract/Registry",
      "Vaults": "$FLOWSCAN_BASE/account/$ORG_ADDRESS/contract/Vaults",
      "MockUSDC": "$FLOWSCAN_BASE/account/$ORG_ADDRESS/contract/MockUSDC",
      "DeFiActions": "$FLOWSCAN_BASE/account/$ORG_ADDRESS/contract/DeFiActions"
    }
  }
}
EOF
    
    print_success "Results saved to: $results_file"
}

# Main function
main() {
    echo -e "${PURPLE}🚀 OmniPools Testnet Demo with FlowScan Integration${NC}"
    echo -e "${PURPLE}===================================================${NC}\n"
    
    check_prerequisites
    check_contracts
    run_demo_flow
    check_final_state
    generate_flowscan_summary
    save_results
    
    print_header "DEMO COMPLETED SUCCESSFULLY! 🎉"
    echo -e "${GREEN}All transactions have been executed on Flow testnet.${NC}"
    echo -e "${GREEN}Use the FlowScan links above to visualize the complete flow.${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "1. Visit the FlowScan links to see transaction details"
    echo "2. Check the vault at: ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}"
    echo "3. Review the saved results file for complete audit trail"
    echo ""
}

# Run main function with error handling
if main "$@"; then
    exit 0
else
    print_error "Demo failed. Check the output above for details."
    exit 1
fi