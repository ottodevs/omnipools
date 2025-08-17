# Flow Testnet Contract Addresses

This document contains the contract addresses needed for TrustFlow to work on Flow testnet.

## Standard Contracts (Already Deployed)

- **FungibleToken**: `0x9a0766d93b6608b7` (Standard Flow testnet address)
- **MetadataViews**: `0x631e88ae7f1d7c20` (Standard Flow testnet address)
- **ViewResolver**: `0x631e88ae7f1d7c20` (Standard Flow testnet address)

## Custom Contracts (✅ DEPLOYED)

Successfully deployed to testnet at account `0x035662afa58bdc22`:

- **Registry**: `0x035662afa58bdc22`
- **Vaults**: `0x035662afa58bdc22` 
- **MockUSDC**: `0x035662afa58bdc22`
- **DeFiActions**: `0x035662afa58bdc22`
- **FungibleTokenConnectors**: `0x035662afa58bdc22`

## Test Accounts

For the demo, we need two funded testnet accounts:

1. **Organizer Account**: `[TO BE CONFIGURED]`
   - Role: Create vaults, set winners, execute payouts
   - Needs: FLOW for fees, MockUSDC for payouts

2. **Participant Account**: `[TO BE CONFIGURED]`
   - Role: Link receiver, participate in pools
   - Needs: FLOW for fees

## Deployment Commands

To deploy contracts to testnet:

```bash
# Configure testnet account in flow.json
flow accounts add testnet-deployer --host access.devnet.nodes.onflow.org:9000

# Deploy contracts
flow deploy --network testnet

# Mint MockUSDC to organizer
flow transactions send cadence/transactions/tx_mint_or_fund_usdc.cdc \
  --network testnet \
  --signer testnet-deployer \
  --arg Address:0x[ORGANIZER_ADDRESS] \
  --arg UFix64:1000.0
```

## Current Status

- ✅ Local emulator working
- ✅ Testnet deployment completed successfully
- ✅ All contracts deployed and verified on testnet
- ✅ App configured for production testnet usage
- ✅ Demo vault created and tested (Vault ID: 1)
- ✅ USDC minter and receiver setup completed

## Fallback Plan

If testnet deployment is not available during the demo:
1. Use local emulator for live demo
2. Show testnet configuration in code
3. Demonstrate full flow on local environment