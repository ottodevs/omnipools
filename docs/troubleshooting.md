# Troubleshooting Guide

## Common Issues and Solutions

### 1. Receiver Missing Path

**Error**: `Could not borrow receiver reference`

**Cause**: Winner hasn't set up their USDC receiver capability

**Solution**:
```bash
# Link USDC receiver for the winner account
flow transactions send ./cadence/transactions/tx_link_usdc_receiver.cdc
```

**Note**: This is handled gracefully by weak guarantees - other winners will still be paid.

### 2. Alias Mismatch

**Error**: `contract not found` or import errors

**Cause**: Flow.json aliases don't match deployed contract addresses

**Solution**:
```bash
# Check current aliases
rg -n "0x[A-Fa-f0-9]{16}" flow.json cadence | sort | uniq

# Reset emulator and redeploy
pkill -f "flow emulator"
sleep 2
flow emulator start --verbose
flow deploy
```

### 3. JSON Args Quoting

**Error**: `invalid argument` or parsing errors

**Cause**: Incorrect JSON formatting in transaction arguments

**Solution**:
```bash
# Use proper JSON escaping
flow transactions send ./cadence/transactions/tx_add_participant.cdc \
  0xf8d6e0586b0a20c7 1 0xf8d6e0586b0a20c7 \
  "{\"team\":\"TeamAlpha\"}"
```

**Common patterns**:
- Escape quotes: `\"` not `"`
- Use proper JSON structure: `{"key":"value"}`
- For arrays: `[{"type":"String","value":"item"}]`

### 4. Emulator Reset

**When to reset**: After contract updates or when state becomes inconsistent

**Full reset process**:
```bash
# Stop emulator
pkill -f "flow emulator"

# Wait for cleanup
sleep 2

# Start fresh
flow emulator start --verbose

# Redeploy contracts
flow deploy

# Run demo
./scripts/demo.sh
```

### 5. USDC Minter Issues

**Error**: `Could not borrow minter reference`

**Cause**: USDC minter not set up

**Solution**:
```bash
# Setup minter first
flow transactions send ./cadence/transactions/tx_setup_minter.cdc

# Then mint USDC
flow transactions send ./cadence/transactions/tx_mint_or_fund_usdc.cdc \
  0xf8d6e0586b0a20c7 "5000.00"
```

### 6. Operation ID Mismatch

**Issue**: `lastOperationId` shows 0 but event shows operationId: 1

**Cause**: Summary not updated after payout

**Solution**:
```bash
# Check current summary
flow scripts execute ./cadence/scripts/sc_get_summary.cdc 0xf8d6e0586b0a20c7 1

# If still showing 0, redeploy contracts
flow deploy --update
```

### 7. Transaction Sequence Errors

**Error**: `sequence number` or `proposal key` errors

**Cause**: Transaction sequence mismatch

**Solution**:
```bash
# Check account sequence
flow accounts get 0xf8d6e0586b0a20c7

# Reset emulator to clear sequence
pkill -f "flow emulator" && sleep 2 && flow emulator start --verbose
```

## Debug Commands

### Check Contract Status
```bash
# Verify contracts deployed
flow deploy

# Check specific contract
flow accounts get 0xf8d6e0586b0a20c7
```

### Verify Vault State
```bash
# Get vault summary
flow scripts execute ./cadence/scripts/sc_get_summary.cdc 0xf8d6e0586b0a20c7 1

# Check winner balances
flow scripts execute ./cadence/scripts/sc_get_winner_balance.cdc 0xf8d6e0586b0a20c7
```

### Monitor Events
```bash
# Watch for PayoutExecuted events
flow events get A.f8d6e0586b0a20c7.Vaults.PayoutExecuted
```

## Quick Recovery

For most issues, this sequence will resolve problems:

```bash
# 1. Reset everything
pkill -f "flow emulator"
sleep 2

# 2. Start fresh
flow emulator start --verbose

# 3. Deploy contracts
flow deploy

# 4. Run demo
./scripts/demo.sh
```

## Getting Help

If issues persist:

1. Check the [runbook](runbook.md) for exact commands
2. Verify all prerequisites are installed
3. Ensure you're using the latest Flow CLI version
4. Check the [actions documentation](actions.md) for system architecture 