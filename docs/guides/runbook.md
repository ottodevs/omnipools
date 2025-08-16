# OmniPools Runbook

## Quick Demo (60 seconds)

```bash
# Terminal A: Start emulator
flow emulator start --verbose

# Terminal B: Run demo
./scripts/demo.sh
```

## Step-by-Step Commands

### 1. Deploy Contracts
```bash
flow deploy
```

### 2. Setup Demo Environment
```bash
# Create vault
flow transactions send ./cadence/transactions/tx_create_vault.cdc --args-json '[{"type": "Address", "value": "0xf8d6e0586b0a20c7"}, {"type": "String", "value": "ETHGlobal NY Bounties"}, {"type": "UInt8", "value": "0"}, {"type": "String", "value": "Top bounties paid via Flow Actions."}, {"type": "Optional", "value": null}, {"type": "Optional", "value": null}, {"type": "Optional", "value": null}, {"type": "Array", "value": [{"type": "String", "value": "usdc:flow"}]}, {"type": "Array", "value": [{"type": "String", "value": "usdc:flow"}]}, {"type": "Optional", "value": null}, {"type": "Optional", "value": null}]'

# Link USDC receiver
flow transactions send ./cadence/transactions/tx_link_usdc_receiver.cdc

# Add participants
flow transactions send ./cadence/transactions/tx_add_participant.cdc 0xf8d6e0586b0a20c7 1 0xf8d6e0586b0a20c7 "{\"team\":\"TeamAlpha\"}"
flow transactions send ./cadence/transactions/tx_add_participant.cdc 0xf8d6e0586b0a20c7 1 0xf8d6e0586b0a20c7 "{\"team\":\"TeamBeta\"}"

# Setup USDC minter
flow transactions send ./cadence/transactions/tx_setup_minter.cdc

# Seed USDC
flow transactions send ./cadence/transactions/tx_mint_or_fund_usdc.cdc 0xf8d6e0586b0a20c7 "5000.00"
```

### 3. Plan Payout
```bash
# Set winners
flow transactions send ./cadence/transactions/tx_set_winners_simple.cdc 0xf8d6e0586b0a20c7 1 3 3000.00 4 2000.00

# Plan payout
flow transactions send ./cadence/transactions/tx_plan_payout.cdc 0xf8d6e0586b0a20c7 1
```

### 4. Execute Payout
```bash
# Execute payout with Flow Actions
flow transactions send ./cadence/transactions/tx_payout_split.cdc 0xf8d6e0586b0a20c7 1
```

### 5. Proof Scripts
```bash
# Get winner balances
flow scripts execute ./cadence/scripts/sc_get_winner_balance.cdc 0xf8d6e0586b0a20c7

# Get vault summary
flow scripts execute ./cadence/scripts/sc_get_summary.cdc 0xf8d6e0586b0a20c7 1

# Get winners list
flow scripts execute ./cadence/scripts/sc_get_winners.cdc 0xf8d6e0586b0a20c7 1
```

## If Stuck

1. **Reset emulator**: `pkill -f "flow emulator" && sleep 2 && flow emulator start --verbose`
2. **Re-deploy**: `flow deploy --update`
3. **Re-run**: `./scripts/demo.sh`

## Expected Outputs

### PayoutExecuted Event
```
Type: A.f8d6e0586b0a20c7.Vaults.PayoutExecuted
Values:
- operationId (UInt64): 1
- totalPaid (UFix64): 5000.00000000
- vaultId (UInt64): 1
```

### Summary After Payout
```json
{
  "vault": {
    "status": "Paid",
    "lastOperationId": 1,
    "totalWinners": 5000.00000000
  }
}
```

## UI Prototype

### One-Command Judge Flow
```bash
# Start emulator, run demo, refresh UI, and serve app
bun run judge
```

### Manual UI Refresh
After running demo commands, update the UI data:

```bash
# Automated data pipeline
bun run snapshot-ui

# This copies CLI results to UI and normalizes JSON
# Output: public/data/summary_after.json, public/data/vault-1.json
```

### UI Features
The UI reads from `/public/data/vault-1.json` and shows:
- **Vault status, operation ID, total paid** with color-coded status chips
- **Winner addresses and amounts** in a clean card layout
- **Misses section** for failed payouts (weak guarantees)
- **Refresh button** to update data from latest CLI run
- **Error handling** with graceful fallbacks and loading states
- **Exact CLI command** for payout execution
- **Proof summary** in JSON format

### UI Screenshots
- **Home**: `/` - Banner with vault link
- **Vault Details**: `/vault/1` - Complete payout status and data
- **Mobile responsive** with proper contrast and spacing 