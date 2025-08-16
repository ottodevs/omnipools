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

echo ">> Creating Org"
flow transactions send ./cadence/transactions/tx_create_org.cdc "OmniPool Labs"

echo ">> Creating Vault"
flow transactions send ./cadence/transactions/tx_create_vault.cdc $ORG \
"{\"name\":\"ETHGlobal NY Bounties\",\"kind\":0,\"description\":\"Top bounties paid via Flow Actions.\",\"bannerCID\":\"ipfs://bafy-demo-banner\",\"logoCID\":\"ipfs://bafy-demo-logo\",\"externalURL\":\"https://demo.omnipool.app\",\"rails\":{\"acceptedIn\":[\"usdc:flow\"],\"payoutOut\":[\"usdc:flow\"]},\"kyc\":{\"thresholdUsd\":1000.0},\"strategyHint\":\"idle\"}"

echo ">> Linking USDC receiver for org (serves as winner for demo)"
flow transactions send ./cadence/transactions/tx_link_usdc_receiver.cdc

echo ">> Adding participants"
flow transactions send ./cadence/transactions/tx_add_participant.cdc $ORG $VAULT_ID $WIN_A "{\"team\":\"TeamAlpha\"}"
flow transactions send ./cadence/transactions/tx_add_participant.cdc $ORG $VAULT_ID $WIN_B "{\"team\":\"TeamBeta\"}"

echo ">> Seeding USDC to Org"
flow transactions send ./cadence/transactions/tx_mint_or_fund_usdc.cdc $ORG "5000.00"

echo ">> Setting winners & planning payout"
flow transactions send ./cadence/transactions/tx_set_winners.cdc $ORG $VAULT_ID \
"[{\"participantId\":1,\"amount\":3000.00,\"chainHint\":\"flow\",\"tokenHint\":\"USDC\"},{\"participantId\":2,\"amount\":2000.00,\"chainHint\":\"flow\",\"tokenHint\":\"USDC\"}]"
flow transactions send ./cadence/transactions/tx_plan_payout.cdc $ORG $VAULT_ID

echo ">> Summary"
flow scripts execute ./cadence/scripts/sc_get_summary.cdc $ORG $VAULT_ID