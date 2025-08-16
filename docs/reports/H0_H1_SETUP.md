# H0→H1 Setup Guide: Baseline OmniPools Implementation

This guide implements the H0→H1 stage of the OmniPools development plan, taking you from a clean emulator to a seeded vault with participants, winners, and payout planned.

## Overview

The H0→H1 stage sets up:
- ✅ FungibleToken interface and MockUSDC implementation
- ✅ Organization and vault creation
- ✅ Participant registration
- ✅ Winner selection and payout planning
- ✅ Complete automation via `scripts/demo.sh`

## Quick Start

### Prerequisites
1. Flow CLI v2.4.1+ installed
2. Flow emulator running (`flow emulator start --verbose`)

### One-Click Demo
```bash
# From project root, run the complete H0→H1 setup:
./scripts/demo.sh
```

This script will:
1. Deploy all contracts (FungibleToken, MockUSDC, Registry, Vaults)
2. Create an organization "OmniPool Labs"
3. Create a vault "ETHGlobal NY Bounties"
4. Set up USDC receiver capabilities
5. Add participants to the vault
6. Seed the organization with 5,000 USDC
7. Set winners and plan payout
8. Display final vault summary

## Components

### Contracts
- **FungibleToken** (`cadence/contracts/FungibleTokenMock.cdc`): Standard interface for fungible tokens
- **MockUSDC** (`cadence/contracts/MockUSDC.cdc`): Test USDC implementation with minting capabilities
- **Registry** (`cadence/contracts/Registry.cdc`): Organization management
- **Vaults** (`cadence/contracts/Vaults.cdc`): Vault and payout logic

### New Transactions
- **tx_link_usdc_receiver.cdc**: Sets up USDC vault and receiver capability for an account
- **tx_mint_or_fund_usdc.cdc**: Mints MockUSDC tokens to a specified account

### Configuration
- **flow.json**: Updated to include FungibleToken and MockUSDC contracts
- **scripts/demo.sh**: Complete automation script

## Manual Step-by-Step

If you prefer to run commands manually:

```bash
# 1. Deploy contracts
flow deploy

# 2. Create organization
flow transactions send ./cadence/transactions/tx_create_org.cdc "OmniPool Labs" "ipfs://bafy-banner-logo"

# 3. Create vault
ORG=0xf8d6e0586b0a20c7
flow transactions send ./cadence/transactions/tx_create_vault.cdc $ORG \
'{"name":"ETHGlobal NY Bounties","kind":0,"description":"Top bounties paid via Flow Actions.","bannerCID":"ipfs://bafy-demo-banner","logoCID":"ipfs://bafy-demo-logo","externalURL":"https://demo.omnipool.app","rails":{"acceptedIn":["usdc:flow"],"payoutOut":["usdc:flow"]},"kyc":{"thresholdUsd":1000.0},"strategyHint":"idle"}'

# 4. Set up USDC receiver
flow transactions send ./cadence/transactions/tx_link_usdc_receiver.cdc

# 5. Add participants
flow transactions send ./cadence/transactions/tx_add_participant.cdc $ORG 1 $ORG '{"team":"TeamAlpha"}'
flow transactions send ./cadence/transactions/tx_add_participant.cdc $ORG 1 $ORG '{"team":"TeamBeta"}'

# 6. Fund with USDC
flow transactions send ./cadence/transactions/tx_mint_or_fund_usdc.cdc $ORG "5000.00"

# 7. Set winners and plan payout
flow transactions send ./cadence/transactions/tx_set_winners.cdc $ORG 1 \
'[{"participantId":1,"amount":3000.00,"chainHint":"flow","tokenHint":"USDC"},{"participantId":2,"amount":2000.00,"chainHint":"flow","tokenHint":"USDC"}]'
flow transactions send ./cadence/transactions/tx_plan_payout.cdc $ORG 1

# 8. Check status
flow scripts execute ./cadence/scripts/sc_get_summary.cdc $ORG 1
```

## Expected Output

After running the demo script, you should see:
- Vault status: "PayoutPlanned"
- Total winners: 2
- Org funded with 5,000 USDC
- Two participants with planned payouts (3,000 and 2,000 USDC)

## Next Steps

You're now ready for Stage H1→H2:
- Add Flow Actions and Connectors
- Implement complete `tx_payout_split.cdc` with real token transfers
- Set up cross-chain capabilities

## Troubleshooting

- **Import errors**: Ensure emulator is running and contracts are deployed in correct order
- **Address errors**: All demo operations use service account (0xf8d6e0586b0a20c7) for simplicity
- **Permission errors**: Check that transactions are signed with correct account

For issues, check the emulator logs with `flow emulator start --verbose`.