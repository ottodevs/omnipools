# OmniPools - Multi-Chain Vault Management

A comprehensive vault management system for bounties, grants, and tournaments built on Flow blockchain.

## 🚀 Quick Start

```bash
# One command setup
make hackathon

# Start frontend
make dev
```

## 🧪 Testing

We support both testing approaches:

```bash
# Our comprehensive tests (recommended for hackathon)
make test

# Flow official testing framework  
make test-flow

# Run both + linting
make test-all
```

## 📋 Prerequisites

- [Bun](https://bun.sh/) - Package manager
- [Flow CLI](https://developers.flow.com/tools/flow-cli) - Flow blockchain tools

## 📚 Documentation

- **[📖 Main Guide](docs/README.md)** - Complete project overview
- **[🗽 Hackathon Guide](docs/HACKATHON.md)** - Essential commands for hackathon
- **[🛠️ Development Guide](docs/DEVELOPMENT.md)** - Best practices and workflow

## 🛠️ Essential Commands

```bash
make hackathon   # Full setup
make dev         # Start frontend
make test        # Run all tests
make status      # Check status
make reset       # Reset everything
```

## 🎯 Demo Commands

```bash
# Run the complete demo with Flow Actions
./scripts/demo.sh

# Check winner balances
flow scripts execute ./cadence/scripts/sc_get_winner_balance.cdc 0xf8d6e0586b0a20c7

# Execute payout manually
flow transactions send ./cadence/transactions/tx_payout_split.cdc 0xf8d6e0586b0a20c7 1
```

## 🔗 Links

- **Frontend**: http://localhost:3000
- **Emulator**: http://localhost:3569
- **Flow Docs**: https://developers.flow.com/

---

Built for ETHGlobal New York 2025 🗽