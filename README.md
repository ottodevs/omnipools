# OmniPools - Flow Actions Payout Automation

One-click prize payouts with weak guarantees via Flow Actions.

## 🚀 Quick Demo

```bash
# One command
bun run judge

# Or step by step
flow emulator start --verbose
./scripts/demo.sh && bun run snapshot-ui
bun run dev
```

## 📋 Prerequisites

- [Bun](https://bun.sh/) - Package manager
- [Node.js](https://nodejs.org/) v22.17.0
- [Flow CLI](https://developers.flow.com/tools/flow-cli) v1.16.x

## 🎯 Demo Flow

1. **Start**: `bun run judge`
2. **Watch**: Emulator starts, demo runs, UI launches
3. **Navigate**: http://localhost:3000/vault/1
4. **Verify**: Status "Paid", opId 1, totalPaid 5000 USDC
5. **Test**: Click refresh, toggle misses demo

## 🔧 Key Features

- **Automated data pipeline** - CLI results → UI data
- **Weak guarantees** - Skip failed transfers, log misses
- **Resilient UI** - Error handling, loading states, mobile responsive
- **One-command demo** - Everything automated

## 📚 Documentation

- **[Demo Runbook](docs/runbook.md)** - Commands and expected outputs
- **[Flow Actions](docs/actions.md)** - Architecture and weak guarantees

## 🎯 Commands

```bash
bun run judge        # Complete demo
bun run reset-run    # Clean environment reset
bun run snapshot-ui  # Refresh UI data
```

---

Built for ETHGlobal New York 2025 🗽