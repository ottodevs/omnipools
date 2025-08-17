# Production Deployment Guide

This guide covers deploying OmniPools to production with Flow testnet integration.

## Overview

OmniPools is deployed as a production-ready application with:
- **Flow Testnet**: Live blockchain integration with real transactions
- **Vercel**: Edge-optimized hosting with global CDN
- **PWA**: Installable mobile app with offline support
- **AI Integration**: OpenAI-powered pool generation with fallbacks

## Flow Testnet Deployment

### Contract Deployment Status ✅

All contracts successfully deployed to Flow testnet:

| Contract | Address | Status | Purpose | Live Contract |
|----------|---------|--------|---------|---------------|
| **Registry** | `0x035662afa58bdc22` | ✅ Live | Organization management | [View](https://testnet.flowscan.io/contract/A.035662afa58bdc22.Registry) |
| **Vaults** | `0x035662afa58bdc22` | ✅ Live | Pool creation and payouts | [View](https://testnet.flowscan.io/contract/A.035662afa58bdc22.Vaults) |
| **MockUSDC** | `0x035662afa58bdc22` | ✅ Live | Test token for payouts | [View](https://testnet.flowscan.io/contract/A.035662afa58bdc22.MockUSDC) |
| **DeFiActions** | `0x035662afa58bdc22` | ✅ Live | Flow Actions integration | [View](https://testnet.flowscan.io/contract/A.035662afa58bdc22.DeFiActions) |
| **FungibleTokenConnectors** | `0x035662afa58bdc22` | ✅ Live | Token bridging utilities | [View](https://testnet.flowscan.io/contract/A.035662afa58bdc22.FungibleTokenConnectors) |

### Standard Flow Contracts

| Contract | Testnet Address | Purpose |
|----------|-----------------|---------|
| **FungibleToken** | `0x9a0766d93b6608b7` | Token standard interface |
| **MetadataViews** | `0x631e88ae7f1d7c20` | NFT metadata standard |
| **ViewResolver** | `0x631e88ae7f1d7c20` | Metadata resolution |

### Deployment Process

#### 1. Account Creation & Funding
```bash
# Create testnet deployer account
flow accounts create --network testnet
# → Created: 0x035662afa58bdc22

# Fund via testnet faucet  
curl -X POST "https://testnet-faucet.onflow.org/fund-account" \
  -H "Content-Type: application/json" \
  -d '{"address":"035662afa58bdc22"}'
# → Funded: 100,000 FLOW tokens
```

#### 2. Contract Compilation & Deployment
```bash
# Deploy all contracts to testnet
flow project deploy --network testnet

# Output:
# DeFiActions -> 0x035662afa58bdc22 ✅
# FungibleTokenConnectors -> 0x035662afa58bdc22 ✅  
# MockUSDC -> 0x035662afa58bdc22 ✅
# Registry -> 0x035662afa58bdc22 ✅
# Vaults -> 0x035662afa58bdc22 ✅
# 🎉 All contracts deployed successfully
```

#### 3. Contract Initialization
```bash
# Create demo organization
flow transactions send cadence/transactions/tx_create_org.cdc "OmniPools Demo" \
  --network testnet --signer deployer
# → Tx: e9e0cf50019cbb4d93138ef3f90e9820c88d08031d4916fa625d21836c850c02

# Setup USDC infrastructure
flow transactions send cadence/transactions/tx_setup_minter.cdc \
  --network testnet --signer deployer
# → Tx: 147cd2d1be07c07a5e4de105a20eed2679ac6d38d7d9ac12f70a092c7cf43b16

flow transactions send cadence/transactions/tx_link_usdc_receiver.cdc \
  --network testnet --signer deployer  
# → Tx: afef29760f895ead5adb2564f6396e1a9187e40a2d6bf836523f243aa2803fcc

# Mint demo USDC
flow transactions send cadence/transactions/tx_mint_or_fund_usdc.cdc \
  0x035662afa58bdc22 "5000.00" --network testnet --signer deployer
# → Tx: a8875ed75455d50f552b5f80adc6da8f7a29622598bdb9f3112fa53225eb07f7
# → Minted: 5,000 USDC
```

#### 4. Demo Vault Creation
```bash
# Create test vault
flow transactions send cadence/transactions/tx_create_vault.cdc \
  --args-json '[
    {"type": "Address", "value": "0x035662afa58bdc22"},
    {"type": "String", "value": "Demo Production Test"},
    {"type": "UInt8", "value": "0"},
    {"type": "String", "value": "Production testnet vault for demo"},
    {"type": "Optional", "value": null},
    {"type": "Optional", "value": null},
    {"type": "Optional", "value": null},
    {"type": "Array", "value": [{"type": "String", "value": "usdc:flow"}]},
    {"type": "Array", "value": [{"type": "String", "value": "usdc:flow"}]},
    {"type": "Optional", "value": null},
    {"type": "Optional", "value": null}
  ]' --network testnet --signer deployer
# → Tx: e04439991ef7315759b75b3156c2fba5b4614a7b4412f7f5d554f28da446cbe6
# → Created: Vault ID 1
```

### Verification Commands

```bash
# Verify account and contracts
flow accounts get 035662afa58bdc22 --network testnet

# Query vault details
flow scripts execute cadence/scripts/sc_get_vault.cdc 0x035662afa58bdc22 1 --network testnet

# Check vault summary
flow scripts execute cadence/scripts/sc_get_summary.cdc 0x035662afa58bdc22 1 --network testnet

# Verify USDC balance
flow scripts execute cadence/scripts/sc_get_winner_balance.cdc 0x035662afa58bdc22 --network testnet
```

## Vercel Deployment

### Environment Configuration

Set these environment variables in Vercel dashboard:

```bash
# Flow Network
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE_TESTNET=https://rest-testnet.onflow.org

# Demo Organization (Testnet Deployer)
NEXT_PUBLIC_DEMO_ORG_ADDRESS=0x035662afa58bdc22

# WalletConnect (Optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=02176f1b2ab20d063240e614c75a4884

# AI Integration (Optional - has fallback)
OPENAI_API_KEY=sk-...

# Production
NODE_ENV=production
```

### Deployment Steps

1. **Connect Repository**: Link GitHub repo to Vercel
2. **Set Environment Variables**: Configure as shown above
3. **Deploy**: Deploy from `main` branch
4. **Verify PWA**: Test manifest at `/manifest.json`
5. **Test Flow Integration**: Connect wallet and create test pool

### Build Configuration

The project includes production-optimized configuration:

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    ppr: 'incremental',
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}
```

## Production Readiness Checklist

### ✅ Flow Integration
- [x] Contracts deployed to testnet with proper addresses
- [x] Cadence 1.0 compliance verified
- [x] FCL configuration for production testnet
- [x] Wallet connection tested with real transactions
- [x] Flow Actions integration for split payouts

### ✅ Security
- [x] Private keys properly managed (gitignored .pkey files)
- [x] Environment variables for sensitive configuration
- [x] Resource-oriented programming prevents double-spending
- [x] Entitlements protect privileged contract functions
- [x] Audit trail with blockchain transaction logs

### ✅ Performance
- [x] Next.js 15 with optimized builds
- [x] Edge Runtime for global performance
- [x] PWA with service worker for offline support
- [x] Optimized bundle size and loading

### ✅ Mobile Experience
- [x] PWA installable on mobile devices
- [x] Touch-friendly UI with 48px minimum touch targets
- [x] Responsive design tested on various screen sizes
- [x] Smooth animations with Framer Motion

### ✅ Monitoring & Debugging
- [x] Block explorer integration for transaction verification
- [x] Comprehensive error handling and user feedback
- [x] Console logging for development debugging
- [x] Transaction status tracking and retry logic

## Live Demo Verification

### Testnet Transactions ✅

All operations verified on Flow testnet:

1. **Organization Setup**: [e9e0cf50019cbb4d](https://testnet.flowscan.io/tx/e9e0cf50019cbb4d93138ef3f90e9820c88d08031d4916fa625d21836c850c02)
2. **Vault Creation**: [e04439991ef7315759b75b3156c2fba5b4614a7b4412f7f5d554f28da446cbe6](https://testnet.flowscan.io/tx/e04439991ef7315759b75b3156c2fba5b4614a7b4412f7f5d554f28da446cbe6)
3. **USDC Setup**: [afef29760f895ead](https://testnet.flowscan.io/tx/afef29760f895ead5adb2564f6396e1a9187e40a2d6bf836523f243aa2803fcc)
4. **USDC Minting**: [a8875ed75455d50f](https://testnet.flowscan.io/tx/a8875ed75455d50f552b5f80adc6da8f7a29622598bdb9f3112fa53225eb07f7)

### Demo Vault Status
- **Vault ID**: 1
- **Organization**: 0x035662afa58bdc22  
- **Name**: "Demo Production Test"
- **Status**: Active
- **USDC Available**: 5,000 USDC for payouts
- **Block Explorer**: [View Account](https://testnet.flowscan.io/account/035662afa58bdc22)

## Troubleshooting

### Common Issues

**"Cannot find declaration" errors**
- Ensure you're using testnet network in the app
- Verify contract addresses match deployment
- Check that browser cache is cleared

**Wallet connection issues**  
- Use Flow testnet compatible wallets (Blocto, Dev Wallet)
- Ensure wallet is set to testnet network
- Clear browser localStorage if needed

**Transaction failures**
- Verify account has sufficient FLOW for gas fees
- Check that all contract dependencies are deployed
- Use block explorer to debug transaction details

### Support Resources

- **Flow Discord**: [discord.gg/flow](https://discord.gg/flow)
- **Documentation**: [developers.flow.com](https://developers.flow.com)
- **Block Explorer**: [testnet.flowscan.io](https://testnet.flowscan.io)
- **Faucet**: [testnet-faucet.onflow.org](https://testnet-faucet.onflow.org)

---

**Status**: 🟢 Production Ready  
**Last Updated**: January 17, 2025  
**Production Ready**: Live Flow testnet deployment