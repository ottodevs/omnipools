# Flow Actions

## Architecture

**Source → Sink** pattern for cross-chain payouts:
- **Source**: Vault with winners and amounts
- **Sink**: Destination wallets via Flow Actions
- **Weak guarantees**: Skip failed transfers, log misses

## Key Concepts

### Operation ID
- Increments on each payout execution
- Tracks total paid amount
- Enables audit trail

### Weak Guarantees
- If receiver missing → skip, don't revert
- Log misses for manual follow-up
- Continue with other winners

### Flow Action
```cadence
// DeFiActions.cdc
pub fun executePayout(
    vaultId: UInt64,
    winners: [Winner],
    operationId: UInt64
): Bool
```

## Demo Scenarios

### Normal Payout
- All winners have receivers → full payout
- Status: "Paid"
- Misses: empty

### Weak Guarantees Demo
- One winner missing receiver → partial payout
- Status: "Paid" 
- Misses: `{"0xf3fcd2c1a78f5eee": "2000.00"}`

## Events

```cadence
pub event PayoutExecuted(
    operationId: UInt64,
    totalPaid: UFix64,
    vaultId: UInt64
)
``` 