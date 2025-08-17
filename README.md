# TrustFlow (OmniPools)

**Mobile-first PWA for chain-abstracted payouts. AI-powered pool creation with audit-ready Flow Actions.**

![TrustFlow Banner](public/assets/omnipools_banner_recommended.png)

## 🚀 Live Demo

**[https://trustflow-omnipools.vercel.app](https://trustflow-omnipools.vercel.app)** - PWA ready for mobile install

**Judge Demo**: See [JUDGE_FLOW.md](JUDGE_FLOW.md) for 60-second evaluation path

## Quick Start

```bash
bun run judge        # Complete demo
```

## ✨ Key Features

### 🤖 AI-Powered Pool Creation
- **Natural language prompts** → Smart pool configurations
- **6 pool templates**: Bounty, Event, Tournament, Grant Round, Group Fund, Staking House
- **Widget suggestions**: KYC, CCTP, LayerZero, VRF, Farcaster integration
- **Real-time generation** with OpenAI + fallback system

### 🔗 On-Chain Metadata Storage
- **Direct blockchain storage** of pool metadata
- **Image handling**: SVG inline (≤24KB) or URL + SHA-256 hash
- **MetadataViews compatible** for Flow NFT standards
- **Audit trail** with timestamps and version history

### ⚡ Flow Actions Payouts
- **Weak guarantees**: Failed recipients don't block successful ones
- **Real USDC transfers** using MockUSDC on Flow testnet
- **Operation tracking** with unique IDs for audit trails
- **Miss handling**: Skipped payments recorded for retry

### 📱 Mobile-First PWA
- **Installable**: Add to home screen on mobile devices
- **Onboarding**: 3 animated screens with swipe navigation
- **Role-based UX**: Organizer, Sponsor, Participant interfaces
- **Responsive design** with touch-friendly interactions

### 🔗 Flow Blockchain Integration
- **Production Testnet**: All contracts deployed at `0x035662afa58bdc22`
- **Cadence 1.0**: Latest standard with resource-oriented programming
- **Flow Actions**: Atomic cross-chain payout execution
- **FCL Integration**: Native wallet connection (Blocto, Flow Wallet)
- **Real Transactions**: Live blockchain operations, no mocks

## 🎯 Judge Demo Flow

### Quick Path (60 seconds)
1. **Visit live app** → Connect Flow testnet wallet → Choose "Organizer" role
2. **Create Pool** → Enter prompt → AI generates recipe → Create on Flow blockchain
3. **Add Winners** → Set addresses and amounts → Transaction to store on-chain
4. **Execute Payout** → Flow Actions split payout → View operation results

### Local Development
```bash
bun run judge  # Starts emulator, deploys contracts, runs demo
```

Navigate to `http://localhost:3000` → Full local blockchain demo

## Screenshots

📸 **Judge-ready screenshots** available in `public/press/`:

- `01_home.png` - Hero section with CTAs
- `02_create.png` - AI recipe generator interface
- `03_pools.png` - Vault #1 and Vault #2 overview
- `04_vault1_top.png` - Paid status, opId, totalPaid
- `05_vault1_winners_misses.png` - Winners and misses display
- `06_vault2_organizer.png` - Organizer role before payout
- `07_vault2_sponsor.png` - Sponsor role with CCTP/LZ previews
- `08_vault2_participant.png` - Participant registration view

## Prerequisites

- [Bun](https://bun.sh/) v1.2.20+
- [Node.js](https://nodejs.org/) v22.17.0
- [Flow CLI](https://developers.flow.com/tools/flow-cli) v1.16.x

## Demo

1. `bun run judge` → Auto-starts emulator, runs demo, launches UI
2. Navigate to http://localhost:3000/vault/1
3. Connect wallet → Execute payout → Verify results

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with App Router and React 19
- **Tailwind CSS 4** for mobile-first responsive design
- **Framer Motion** for smooth animations and transitions
- **Zustand** for lightweight state management
- **PWA** with service worker and installable manifest

### Blockchain
- **Flow Blockchain** with Cadence smart contracts
- **FCL (Flow Client Library)** for wallet integration
- **Flow Actions** for atomic multi-recipient payouts
- **MetadataViews** for standardized NFT metadata

### AI & APIs
- **Vercel AI SDK** with OpenAI integration
- **Fallback system** for offline/rate-limited scenarios
- **Real-time streaming** responses with error handling

### Infrastructure
- **Vercel** deployment with Edge Runtime
- **Flow Testnet** for live blockchain operations
- **Environment-based** configuration (local/testnet/mainnet)

## 🔗 Flow Blockchain Integration

### Production Testnet Deployment ✅
**All contracts live at**: `0x035662afa58bdc22`

| Contract | Purpose | Status |
|----------|---------|--------|
| **Registry** | Organization management | ✅ Live |
| **Vaults** | Pool creation & payouts | ✅ Live |
| **MockUSDC** | Test token (Cadence 1.0) | ✅ Live |
| **DeFiActions** | Flow Actions integration | ✅ Live |
| **FungibleTokenConnectors** | Cross-chain utilities | ✅ Live |

**Block Explorer**: [View on Flowscan](https://testnet.flowscan.io/account/035662afa58bdc22)

### Flow Actions Integration
- **Atomic Payouts**: Multi-recipient transfers in single transaction
- **Weak Guarantees**: Failed recipients don't block successful ones  
- **Cross-Chain Ready**: Architecture for CCTP and LayerZero integration
- **Audit Trail**: Immutable blockchain records for compliance

## 📖 Documentation

### Core Documentation
- **[Flow Integration](docs/flow-integration.md)** - Blockchain architecture & Flow Actions
- **[Flow Showcase](docs/flow-showcase.md)** - Flow ecosystem highlights & innovation
- **[Deployment Guide](docs/deployment.md)** - Production testnet deployment  
- **[Flow Actions](docs/flow-actions.md)** - Atomic payouts & cross-chain architecture
- **[Testing Guide](docs/testing.md)** - Verification & testing procedures
- **[Judge Flow](JUDGE_FLOW.md)** - 60-second evaluation path

### Development
- **[Setup Guide](docs/setup.md)** - Local development environment
- **[Architecture](docs/architecture.md)** - System design overview  
- **[API Reference](docs/runbook.md)** - Commands and scripts
- **[Actions Guide](docs/actions.md)** - Available operations

### Deployment
- **[Testnet Addresses](TESTNET_ADDRESSES.md)** - Live contract addresses
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Production readiness
- **[Wallet Troubleshooting](WALLET_TROUBLESHOOTING.md)** - Common issues

## 🏆 Sponsor Fit

### Flow 🏆
- **Production Deployment**: Live testnet at `0x035662afa58bdc22` with 5 contracts
- **Cadence 1.0**: Latest standard with resource-oriented programming
- **Flow Actions**: Atomic multi-recipient payouts with weak guarantees
- **FCL Integration**: Native wallet connection and transaction handling
- **MetadataViews**: Standard-compliant on-chain metadata storage
- **Security**: Entitlements, capabilities, and resource safety
- **Innovation**: AI-assisted pool creation + blockchain execution

### Circle (Roadmap)
- **CCTP integration** planned for cross-chain treasury management
- **USDC native** payout system architecture ready

### LayerZero (Roadmap)  
- **Cross-chain mirroring** of vault state and payout receipts
- **Omnichain** audit trail for compliance

---

**Built for ETHGlobal New York 2025** 🗽  
**Team**: TrustFlow  
**Live Demo**: [trustflow-omnipools.vercel.app](https://trustflow-omnipools.vercel.app)