# OmniPools

Chain-abstracted payouts for events. Atomic, audit-ready.

## Live Demo

🚀 **[Live Demo](https://omnipools-3tv0n7q64-ottodevs-projects.vercel.app)** - Deployed and verified ✅

## Quick Start

```bash
bun run judge        # Complete demo
```

## Judge Flow (60-second demo path)

For web demo evaluation, follow this path:

1. **Create** → `/create` - AI recipe generator with prompt interface
2. **Save Draft** → Generate and save vault configuration
3. **View Pools** → `/pools` - See Vault #1 and Vault #2 cards
4. **Vault #2 Demo** → `/vault/2` - Switch between roles:
   - **Organizer**: Run payout simulation
   - **Sponsor**: View CCTP/LZ CLI previews  
   - **Participant**: Register and ready status

### Local "Real Payout" Flow

For full local demo with actual blockchain transactions:

```bash
bun run judge  # Starts emulator, deploys contracts, runs demo
```

Navigate to `http://localhost:3000/vault/1` → Connect wallet → Execute payout → Verify results

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

## Documentation

- **[Setup Guide](docs/setup.md)** - Environment and development
- **[Architecture](docs/architecture.md)** - Flow Actions and contracts
- **[API Reference](docs/runbook.md)** - Commands and scripts

---

Built for ETHGlobal New York 2025 🗽