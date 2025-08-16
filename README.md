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

## 🖥️ UI Prototype (mocked)

```bash
# Start the UI prototype
npm run dev

# Open in browser
open http://localhost:3000
```

- **Home**: `/` - Shows banner and link to vault
- **Vault Details**: `/vault/1` - View winners, status, opId, totalPaid
- **Mock Payout**: Shows exact CLI command for judges
- **Data**: Read from `/public/data/vault-1.json` (no backend writes)

## 📊 Demo Results

- **[Demo Results](assets/demo_results.txt)** - Key metrics and operation IDs
- **[Summary After Payout](assets/summary_after.txt)** - Complete vault state after payout

## 🔗 Links

- **Frontend**: http://localhost:3000
- **Emulator**: http://localhost:3569
- **Flow Docs**: https://developers.flow.com/

---

Built for ETHGlobal New York 2025 🗽