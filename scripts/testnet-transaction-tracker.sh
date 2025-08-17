#!/usr/bin/env bash
set -euo pipefail

# Testnet Transaction Tracker
# A simpler script that runs the demo flow and tracks transaction IDs for FlowScan

# Configuration
NETWORK="testnet"
DEPLOYER_ACCOUNT="deployer"
ORG_ADDRESS="0x035662afa58bdc22"
VAULT_ID=1

# FlowScan base URL
FLOWSCAN_BASE="https://testnet.flowscan.org"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to execute transaction and extract ID
run_tx() {
    local tx_file="$1"
    local description="$2"
    shift 2
    local args=("$@")
    
    echo -e "${BLUE}Executing:${NC} $description"
    
    # Build command
    local cmd="flow transactions send $tx_file --network $NETWORK --signer $DEPLOYER_ACCOUNT"
    if [ ${#args[@]} -gt 0 ]; then
        for arg in "${args[@]}"; do
            cmd="$cmd \"$arg\""
        done
    fi
    
    echo "Command: $cmd"
    
    # Execute and capture transaction ID
    local output
    if output=$(eval "$cmd" 2>&1); then
        local tx_id
        if tx_id=$(echo "$output" | grep -oE "0x[a-fA-F0-9]{64}" | head -1); then
            echo -e "${GREEN}✓ Success:${NC} $tx_id"
            echo -e "${YELLOW}FlowScan:${NC} ${FLOWSCAN_BASE}/transaction/${tx_id}"
            echo "$description|$tx_id|${FLOWSCAN_BASE}/transaction/${tx_id}" >> testnet_transactions.log
        else
            echo "✓ Transaction sent (ID not captured)"
            echo "$description|unknown|unknown" >> testnet_transactions.log
        fi
    else
        echo "✗ Failed: $output"
        return 1
    fi
    echo ""
}

# Clear previous log
> testnet_transactions.log

echo "🚀 Running OmniPools Demo on Flow Testnet"
echo "=========================================="
echo ""

# Check if contracts are deployed
echo "Checking contract deployment status..."
if flow accounts get "$ORG_ADDRESS" --network "$NETWORK" >/dev/null 2>&1; then
    echo "✓ Deployer account accessible"
else
    echo "✗ Cannot access deployer account. Check your flow.json configuration."
    exit 1
fi
echo ""

# Run the demo flow
echo "Starting transaction sequence..."
echo ""

# 1. Create organization
run_tx "./cadence/transactions/tx_create_org.cdc" "Create Organization" "OmniPool Labs"

# 2. Create vault with simplified args
run_tx "./cadence/transactions/tx_create_vault_simple.cdc" "Create Vault" \
    "$ORG_ADDRESS" "ETHGlobal NY Bounties" "Demo vault for testnet" "1"

# 3. Link USDC receiver
run_tx "./cadence/transactions/tx_link_usdc_receiver.cdc" "Link USDC Receiver"

# 4. Add participants
run_tx "./cadence/transactions/tx_add_participant.cdc" "Add Participant Alpha" \
    "$ORG_ADDRESS" "$VAULT_ID" "$ORG_ADDRESS" "{\"team\":\"TeamAlpha\"}"

run_tx "./cadence/transactions/tx_add_participant.cdc" "Add Participant Beta" \
    "$ORG_ADDRESS" "$VAULT_ID" "$ORG_ADDRESS" "{\"team\":\"TeamBeta\"}"

# 5. Setup USDC minter
run_tx "./cadence/transactions/tx_setup_minter.cdc" "Setup USDC Minter"

# 6. Mint USDC
run_tx "./cadence/transactions/tx_mint_or_fund_usdc.cdc" "Mint USDC" \
    "$ORG_ADDRESS" "5000.00"

# 7. Set winners
run_tx "./cadence/transactions/tx_set_winners_simple.cdc" "Set Winners" \
    "$ORG_ADDRESS" "$VAULT_ID" "1" "3000.00" "2" "2000.00"

# 8. Plan payout
run_tx "./cadence/transactions/tx_plan_payout.cdc" "Plan Payout" \
    "$ORG_ADDRESS" "$VAULT_ID"

# 9. Execute payout
run_tx "./cadence/transactions/tx_payout_split.cdc" "Execute Payout" \
    "$ORG_ADDRESS" "$VAULT_ID"

echo "🎉 Demo completed!"
echo ""

# Generate summary
echo "TRANSACTION SUMMARY"
echo "==================="
echo ""

counter=1
while IFS='|' read -r description tx_id flowscan_url; do
    echo "${counter}. $description"
    echo "   TX ID: $tx_id"
    if [ "$flowscan_url" != "unknown" ]; then
        echo "   FlowScan: $flowscan_url"
    fi
    echo ""
    ((counter++))
done < testnet_transactions.log

echo "USEFUL LINKS"
echo "============"
echo "Org Account: ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}"
echo "Registry Contract: ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}/contract/Registry"
echo "Vaults Contract: ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}/contract/Vaults"
echo "MockUSDC Contract: ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}/contract/MockUSDC"
echo ""
echo "Transaction log saved to: testnet_transactions.log"