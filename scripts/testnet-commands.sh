#!/usr/bin/env bash

# Testnet Commands for OmniPools Demo
# This script provides the exact commands to run the demo flow on testnet

# Configuration
ORG_ADDRESS="0x035662afa58bdc22"
VAULT_ID=1
FLOWSCAN_BASE="https://testnet.flowscan.org"

echo "🚀 OmniPools Testnet Demo Commands"
echo "=================================="
echo ""
echo "Organization Address: $ORG_ADDRESS"
echo "FlowScan Base: $FLOWSCAN_BASE"
echo ""

echo "📋 Execute these commands one by one:"
echo ""

echo "1. Create Organization:"
echo "flow transactions send ./cadence/transactions/tx_create_org.cdc --network testnet --signer deployer \"OmniPool Labs\""
echo ""

echo "2. Create Vault:"
echo "flow transactions send ./cadence/transactions/tx_create_vault_simple.cdc --network testnet --signer deployer $ORG_ADDRESS \"ETHGlobal NY Bounties\" \"Demo vault for testnet\" 1"
echo ""

echo "3. Link USDC Receiver:"
echo "flow transactions send ./cadence/transactions/tx_link_usdc_receiver.cdc --network testnet --signer deployer"
echo ""

echo "4. Add Participant Alpha:"
echo "flow transactions send ./cadence/transactions/tx_add_participant.cdc --network testnet --signer deployer $ORG_ADDRESS $VAULT_ID $ORG_ADDRESS \"{\\\"team\\\":\\\"TeamAlpha\\\"}\""
echo ""

echo "5. Add Participant Beta:"
echo "flow transactions send ./cadence/transactions/tx_add_participant.cdc --network testnet --signer deployer $ORG_ADDRESS $VAULT_ID $ORG_ADDRESS \"{\\\"team\\\":\\\"TeamBeta\\\"}\""
echo ""

echo "6. Setup USDC Minter:"
echo "flow transactions send ./cadence/transactions/tx_setup_minter.cdc --network testnet --signer deployer"
echo ""

echo "7. Mint USDC:"
echo "flow transactions send ./cadence/transactions/tx_mint_or_fund_usdc.cdc --network testnet --signer deployer $ORG_ADDRESS 5000.00"
echo ""

echo "8. Set Winners:"
echo "flow transactions send ./cadence/transactions/tx_set_winners_simple.cdc --network testnet --signer deployer $ORG_ADDRESS $VAULT_ID 1 3000.00 2 2000.00"
echo ""

echo "9. Plan Payout:"
echo "flow transactions send ./cadence/transactions/tx_plan_payout.cdc --network testnet --signer deployer $ORG_ADDRESS $VAULT_ID"
echo ""

echo "10. Execute Payout:"
echo "flow transactions send ./cadence/transactions/tx_payout_split.cdc --network testnet --signer deployer $ORG_ADDRESS $VAULT_ID"
echo ""

echo "📊 Query Commands:"
echo ""

echo "Get Vault Summary:"
echo "flow scripts execute ./cadence/scripts/sc_get_summary.cdc --network testnet $ORG_ADDRESS $VAULT_ID"
echo ""

echo "Get Participants:"
echo "flow scripts execute ./cadence/scripts/sc_get_participants.cdc --network testnet $ORG_ADDRESS $VAULT_ID"
echo ""

echo "Get Winners:"
echo "flow scripts execute ./cadence/scripts/sc_get_winners.cdc --network testnet $ORG_ADDRESS $VAULT_ID"
echo ""

echo "Get Winner Balance:"
echo "flow scripts execute ./cadence/scripts/sc_get_winner_balance.cdc --network testnet $ORG_ADDRESS"
echo ""

echo "🔗 FlowScan Links:"
echo ""
echo "Organization Account: ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}"
echo "Registry Contract: ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}/contract/Registry"
echo "Vaults Contract: ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}/contract/Vaults"
echo "MockUSDC Contract: ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}/contract/MockUSDC"
echo "DeFiActions Contract: ${FLOWSCAN_BASE}/account/${ORG_ADDRESS}/contract/DeFiActions"
echo ""

echo "💡 Tips:"
echo "- Copy each command and run it manually"
echo "- After each transaction, copy the transaction ID"
echo "- Visit ${FLOWSCAN_BASE}/transaction/[TX_ID] to see details"
echo "- All transactions will appear under the organization account"
echo ""

echo "🎯 Quick Test Command:"
echo "flow scripts execute ./cadence/scripts/sc_get_vault_metadata.cdc --network testnet $ORG_ADDRESS"