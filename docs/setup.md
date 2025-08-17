# Setup Guide

## Environment Setup

### Prerequisites
```bash
# Install dependencies
bun install

# Start Flow emulator
flow emulator start --persist
```

### Environment Variables
Create `.env.local`:
```bash
NEXT_PUBLIC_FLOW_NETWORK=local
NEXT_PUBLIC_DEMO_ORG_ADDRESS=0xf8d6e0586b0a20c7
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Development

### Full Demo
```bash
bun run judge        # Emulator + demo + UI
```

### Step by Step
```bash
flow emulator start --verbose
./scripts/demo.sh
bun run snapshot-ui
bun run dev
```

### Commands
- `bun run dev` - Start Next.js dev server
- `bun run reset-run` - Clean reset and run
- `bun run snapshot-ui` - Refresh UI data from CLI
- `flow:test:integration` - Test Flow integration

## Network Configuration

- **Local**: `http://localhost:8888` (emulator)
- **Testnet**: `https://rest-testnet.onflow.org`
- **Mainnet**: `https://rest-mainnet.onflow.org`

Switch networks in UI or set `NEXT_PUBLIC_FLOW_NETWORK`.

## Troubleshooting

### Common Issues
- **"prepAccount" error**: Use Dev Wallet with correct network
- **Contract not found**: Ensure emulator is running and deployed
- **Network mismatch**: Check `NEXT_PUBLIC_FLOW_NETWORK` setting

### Reset Environment
```bash
pkill -f "flow emulator"
flow emulator start --verbose
./scripts/demo.sh
```