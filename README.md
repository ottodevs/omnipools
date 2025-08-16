# OmniPools - Multi-Chain Vault Management

A comprehensive vault management system for bounties, grants, and tournaments built on Flow blockchain.

## 🚀 60-Second Judge Run

```bash
# Start emulator and run demo
flow emulator start --verbose
./scripts/demo.sh
```

The demo will:
1. Deploy contracts
2. Create vault with participants
3. Set winners and plan payout
4. Execute payout via Flow Actions
5. Show final balances and summary

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
- [Node.js](https://nodejs.org/) v22.17.0 (see .nvmrc)
- [Flow CLI](https://developers.flow.com/tools/flow-cli) v1.16.x - Flow blockchain tools

## 📚 Documentation

- **[📖 Documentation Hub](docs/README.md)** - Complete documentation index
- **[🚀 Getting Started](docs/guides/)** - Overview, hackathon guide, runbook
- **[🛠️ Development](docs/development/)** - Development guides and best practices
- **[📖 Reference](docs/reference/)** - Architecture and API documentation
- **[📊 Reports](docs/reports/)** - Technical reports and summaries

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

## 🖥️ UI Prototype

```bash
# One-command judge flow (recommended)
bun run judge

# Or step by step:
bun run dev          # Start UI
bun run snapshot-ui  # Refresh data from CLI results

# If emulator already running:
./scripts/demo.sh && bun run snapshot-ui && bun run dev
```

- **Home**: `/` - Shows banner and link to vault
- **Vault Details**: `/vault/1` - View winners, status, opId, totalPaid
- **Refresh Button**: Updates data from latest CLI run
- **Error Handling**: Graceful fallbacks and loading states
- **Data Pipeline**: `scripts/refresh-ui.sh` copies CLI results to UI

## 📊 Demo Results

- **[Demo Results](assets/demo_results.txt)** - Key metrics and operation IDs
- **[Summary After Payout](assets/summary_after.txt)** - Complete vault state after payout

## 🔗 Links

- **Frontend**: http://localhost:3000
- **Emulator**: http://localhost:3569
- **Flow Docs**: https://developers.flow.com/

---

Built for ETHGlobal New York 2025 🗽