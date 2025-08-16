# 🗽 Hackathon Guide

## 🚀 Quick Setup

```bash
# One command setup
make hackathon

# Start frontend
make dev
```

## 📋 Essential Commands

### Setup & Development
```bash
make install     # Install dependencies
make setup       # Setup emulator + deploy
make dev         # Start frontend
make flow        # Start emulator
```

### Testing
```bash
make test        # All tests
make test-simple # Basic tests
make test-e2e    # End-to-end
make test-vault  # Vault operations
```

### Debug & Status
```bash
make status      # Check status
make logs        # View logs
make reset       # Reset everything
```

## 🔧 Contract Addresses

After setup, contracts are deployed to:
- **Registry**: `f8d6e0586b0a20c7`
- **Vaults**: `f8d6e0586b0a20c7`
- **FungibleTokenMock**: `f8d6e0586b0a20c7`

## 📄 Key Transactions

### Organization Management
```bash
# Create org
flow transactions send cadence/transactions/tx_create_org.cdc "My Org" "ipfs://logo"

# Issue creator badge
flow transactions send cadence/transactions/tx_issue_creator_badge.cdc 0xORG 0xCREATOR
```

### Vault Operations
```bash
# Create vault
flow transactions send cadence/transactions/tx_create_vault.cdc 0xORG \
  "My Vault" 0 "Description" nil nil nil '["FLOW"]' '["FLOW"]' nil nil

# Add participant
flow transactions send cadence/transactions/tx_add_participant.cdc 0xORG 1 0xPARTICIPANT '{"name":"John"}'

# Set winners
flow transactions send cadence/transactions/tx_set_winners.cdc 0xORG 1 \
  '[{"participantId":1,"amount":1000.0,"chainHint":"FLOW","tokenHint":"USDC"}]'
```

## 📊 Key Scripts

### Read Operations
```bash
# Get vault summary
flow scripts execute cadence/scripts/sc_get_summary.cdc 0xORG 1

# List participants
flow scripts execute cadence/scripts/sc_get_participants.cdc 0xORG 1

# Get winners
flow scripts execute cadence/scripts/sc_get_winners.cdc 0xORG 1

# List org vaults
flow scripts execute cadence/scripts/sc_list_vaults_by_org.cdc 0xORG
```

## 🏗️ Vault Types

- **0**: Bounty (single winner)
- **1**: StakingHouse (multi-participant)
- **2**: GrantRound (funding)
- **3**: Tournament (multi-stage)
- **4**: GroupFund (collaborative)

## 🔗 URLs

- **Frontend**: http://localhost:3000
- **Emulator**: http://localhost:3569
- **Flow Docs**: https://developers.flow.com/

## 🆘 Quick Fixes

### Emulator Issues
```bash
make reset       # Reset emulator
flow emulator stop && flow emulator start --persist
```

### Contract Issues
```bash
flow deploy --reset  # Force redeploy
flow accounts get emulator-account  # Check accounts
```

### Frontend Issues
```bash
make clean       # Clear cache
bun install      # Reinstall deps
```

## 🎯 Common Patterns

### Create Complete Workflow
```bash
# 1. Setup
make hackathon

# 2. Create org
flow transactions send cadence/transactions/tx_create_org.cdc "Test Org" nil

# 3. Create vault
flow transactions send cadence/transactions/tx_create_vault.cdc 0xf8d6e0586b0a20c7 \
  "Test Vault" 0 "Description" nil nil nil '["FLOW"]' '["FLOW"]' nil nil

# 4. Add participants
flow transactions send cadence/transactions/tx_add_participant.cdc 0xf8d6e0586b0a20c7 1 0x01cf0e2f2f715450 '{"name":"Alice"}'

# 5. Set winners
flow transactions send cadence/transactions/tx_set_winners.cdc 0xf8d6e0586b0a20c7 1 \
  '[{"participantId":1,"amount":1000.0,"chainHint":"FLOW","tokenHint":"USDC"}]'

# 6. Query results
flow scripts execute cadence/scripts/sc_get_summary.cdc 0xf8d6e0586b0a20c7 1
```

## 🚨 Emergency Commands

```bash
# Nuclear reset
rm -rf flowdb && make reset

# Fresh start
make clean && make hackathon

# Check everything
make status && make test
```

## 📝 Development Tips

### Contract Development
- Use `access(all)` for public functions
- Always destroy resources
- Emit events for state changes
- Test all edge cases

### Frontend Development
- Use React 19 features
- Implement proper loading states
- Handle wallet connection errors
- Use TypeScript strictly

---

**Happy Hacking! 🗽⚡** 