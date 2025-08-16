# OmniPools Documentation

## Quick Start

```bash
# One command demo
bun run judge

# Or step by step
flow emulator start --verbose
./scripts/demo.sh && bun run snapshot-ui
bun run dev
```

## Core Files

- **`docs/runbook.md`** - Demo commands and expected outputs
- **`docs/actions.md`** - Flow Actions architecture and weak guarantees

## Demo Flow

1. **Start**: `bun run judge` (or step-by-step above)
2. **Watch**: Emulator starts, demo runs, UI launches  
3. **Navigate**: http://localhost:3000/vault/1
4. **Verify**: Status "Paid", opId 1, totalPaid 5000 USDC
5. **Test**: Click refresh button, toggle misses demo

## Key Features

- **Automated data pipeline** - CLI results → UI data
- **Resilient UI** - Error handling, loading states, mobile responsive
- **Weak guarantees** - Misses demo shows failed payouts
- **One-command demo** - Everything automated 