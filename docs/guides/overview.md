# OmniPools - Multi-Chain Vault Management

A comprehensive vault management system for bounties, grants, and tournaments built on Flow blockchain.

## 🚀 Quick Start

```bash
# One command setup
make hackathon

# Start development
make dev
```

## 📋 Prerequisites

- [Bun](https://bun.sh/) - Package manager
- [Flow CLI](https://developers.flow.com/tools/flow-cli) - Flow blockchain tools

## 🛠️ Development Commands

### Setup
```bash
make install     # Install dependencies
make setup       # Setup emulator + deploy contracts
make hackathon   # Full setup (recommended)
```

### Development
```bash
make dev         # Start Next.js dev server
make flow        # Start Flow emulator
make test        # Run all tests
```

### Testing
```bash
make test-simple # Basic contract tests
make test-e2e    # End-to-end tests
make test-vault  # Vault operations
```

### Debug & Status
```bash
make status      # Check emulator status
make logs        # View emulator logs
make reset       # Reset emulator
```

## 🏗️ Architecture

### Smart Contracts
- **Registry.cdc** - Organization and badge management
- **Vaults.cdc** - Multi-vault system with participants/winners
- **FungibleTokenMock.cdc** - Mock token for testing

### Frontend
- **Next.js 15** with React 19
- **Flow React SDK** for wallet integration
- **Tailwind CSS** for styling

## 📁 Project Structure

```
├── cadence/
│   ├── contracts/     # Smart contracts
│   ├── scripts/       # Read-only operations
│   ├── transactions/  # State-changing operations
│   └── test/         # Contract tests
├── src/
│   ├── app/          # Next.js app router
│   └── components/   # React components
├── docs/             # Documentation
├── scripts/          # Setup scripts
├── Makefile          # Development commands
└── flow.json         # Flow configuration
```

## 🔧 Contract Features

### Vault Types
- **Bounty** - Single winner competitions
- **StakingHouse** - Multi-participant pools
- **GrantRound** - Funding rounds
- **Tournament** - Multi-stage competitions
- **GroupFund** - Collaborative funding

### Key Operations
- Create organizations and vaults
- Add participants and operators
- Record funding and receipts
- Set winners and plan payouts
- Multi-chain payout support

## 🧪 Testing

```bash
# Run all tests
make test

# Individual test suites
make test-simple  # Basic functionality
make test-e2e     # Full workflows
make test-vault   # Vault operations
```

## 🚀 Deployment

### Local Development
```bash
make setup        # Deploy to emulator
make dev          # Start frontend
```

### Testnet/Mainnet
```bash
# Update flow.json networks
flow deploy --network testnet
```

## 📚 API Reference

### Core Transactions
- `tx_create_org.cdc` - Create organization
- `tx_create_vault.cdc` - Create vault
- `tx_add_participant.cdc` - Add participant
- `tx_set_winners.cdc` - Set winners
- `tx_plan_payout.cdc` - Plan payout

### Core Scripts
- `sc_get_summary.cdc` - Get vault summary
- `sc_get_participants.cdc` - List participants
- `sc_get_winners.cdc` - Get winners
- `sc_list_vaults_by_org.cdc` - List org vaults

## 🔗 Links

- **Frontend**: http://localhost:3000
- **Emulator**: http://localhost:3569
- **Flow Docs**: https://developers.flow.com/
- **Cadence Docs**: https://developers.flow.com/cadence

## 🆘 Troubleshooting

```bash
# Reset everything
make reset

# Check status
make status

# View logs
make logs
```

---

Built for ETHGlobal New York 2025 🗽 