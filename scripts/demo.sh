#!/usr/bin/env bash
set -euo pipefail

ORG=0xf8d6e0586b0a20c7
VAULT_ID=1
# For demo purposes, using service account as both org and winner
# In production, these would be different accounts
WIN_A=0xf8d6e0586b0a20c7
WIN_B=0xf8d6e0586b0a20c7

echo ">> Deploying contracts"
flow deploy

echo ">> Creating Org (skipping - already exists)"
# flow transactions send ./cadence/transactions/tx_create_org.cdc "OmniPool Labs"

echo ">> Creating Vault"
flow transactions send ./cadence/transactions/tx_create_vault.cdc --args-json '[{"type": "Address", "value": "0xf8d6e0586b0a20c7"}, {"type": "String", "value": "Demo Bounties Pool"}, {"type": "UInt8", "value": "0"}, {"type": "String", "value": "Top bounties paid via Flow Actions."}, {"type": "Optional", "value": null}, {"type": "Optional", "value": null}, {"type": "Optional", "value": null}, {"type": "Array", "value": [{"type": "String", "value": "usdc:flow"}]}, {"type": "Array", "value": [{"type": "String", "value": "usdc:flow"}]}, {"type": "Optional", "value": null}, {"type": "Optional", "value": null}]'

echo ">> Linking USDC receiver for org (serves as winner for demo)"
flow transactions send ./cadence/transactions/tx_link_usdc_receiver.cdc

echo ">> Adding participants"
flow transactions send ./cadence/transactions/tx_add_participant.cdc $ORG $VAULT_ID $WIN_A "{\"team\":\"TeamAlpha\"}"
flow transactions send ./cadence/transactions/tx_add_participant.cdc $ORG $VAULT_ID $WIN_B "{\"team\":\"TeamBeta\"}"

echo ">> Setting up USDC minter"
flow transactions send ./cadence/transactions/tx_setup_minter.cdc

echo ">> Seeding USDC to Org"
flow transactions send ./cadence/transactions/tx_mint_or_fund_usdc.cdc $ORG "5000.00"

echo ">> Setting winners & planning payout"
flow transactions send ./cadence/transactions/tx_set_winners_simple.cdc $ORG $VAULT_ID 1 3000.00 2 2000.00
flow transactions send ./cadence/transactions/tx_plan_payout.cdc $ORG $VAULT_ID

echo ">> Summary"
flow scripts execute ./cadence/scripts/sc_get_summary.cdc $ORG $VAULT_ID

echo ">> Executing payout with Flow Actions"
flow transactions send ./cadence/transactions/tx_payout_split.cdc $ORG $VAULT_ID

echo ">> Winner balances (after)"
flow scripts execute ./cadence/scripts/sc_get_winner_balance.cdc $WIN_A > .cache/bal_after_A.json
flow scripts execute ./cadence/scripts/sc_get_winner_balance.cdc $WIN_B > .cache/bal_after_B.json

echo ">> Summary after payout"
flow scripts execute ./cadence/scripts/sc_get_summary.cdc $ORG $VAULT_ID > .cache/summary_after.json