# Flow Actions Payout System

## Overview

OmniPools uses Flow Actions for native connector-based payouts, providing weak guarantees and operation tracking for reliable vault management.

## Architecture

```
VaultSource(USDC) → VaultSink(winners)
```

### Components

1. **VaultSource**: USDC vault from organization storage (`/storage/USDCVault`)
2. **VaultSink**: Individual USDC receivers for each winner (`/public/USDCReceiver`)
3. **Operation Tracking**: Unique operationId for each payout execution
4. **Weak Guarantees**: Graceful handling of missing receivers

## Payout Flow

### 1. Source Setup
```cadence
// Borrow USDC source from org storage
let orgUSDCVault = signer.storage.borrow<&{FungibleToken.Vault}>(
    from: /storage/USDCVault
) ?? panic("Could not borrow org USDC vault")
```

### 2. Winner Processing
```cadence
// Get Flow/USDC winners from vault
let winners = vaultRef.getFlowUSDCWinners()

for w in winners {
    // Check receiver capability
    let receiver = recipientAccount.capabilities.borrow<&{FungibleToken.Receiver}>(
        /public/USDCReceiver
    )
    
    if receiver == nil {
        // Weak guarantee: skip, record miss
        misses[w.addr] = w.amount
        continue
    }
    
    // Transfer tokens
    let tokens <- orgUSDCVault.withdraw(amount: w.amount)
    receiver!.deposit(from: <-tokens)
    totalPaid = totalPaid + w.amount
}
```

### 3. Operation Tracking
```cadence
// Get next operation ID
let opId = vaultRef.getNextOperationId()

// Mark paid with details
vaultRef.markPaidWithDetails(opId: opId, totalPaid: totalPaid, misses: misses)
```

## Weak Guarantees

The system implements weak guarantees to handle real-world scenarios:

- **Missing Receivers**: If a winner hasn't set up their USDC receiver, the payout continues for other winners
- **Partial Success**: Only successfully paid amounts are recorded in `totalPaid`
- **Miss Tracking**: Failed payments are recorded in `misses` map for later resolution

## Event Schema

### PayoutExecuted Event
```cadence
event PayoutExecuted(vaultId: UInt64, operationId: UInt64, totalPaid: UFix64)
```

**Fields:**
- `vaultId`: Unique identifier for the vault
- `operationId`: Sequential operation number for tracking
- `totalPaid`: Actual amount successfully transferred

### Example Event
```
Type: A.f8d6e0586b0a20c7.Vaults.PayoutExecuted
Values:
- vaultId (UInt64): 1
- operationId (UInt64): 1
- totalPaid (UFix64): 5000.00000000
```

## Operation ID System

Each payout operation gets a unique, sequential ID:

1. **Generation**: `vaultRef.getNextOperationId()` returns current ID
2. **Increment**: ID is incremented after successful payout
3. **Tracking**: Used in events and summary for audit trail

### Usage in Summary
```json
{
  "vault": {
    "lastOperationId": 1,
    "status": "Paid"
  }
}
```

## Benefits

1. **Native Integration**: Uses Flow's built-in token connectors
2. **Reliability**: Weak guarantees prevent complete failures
3. **Auditability**: Operation IDs provide clear tracking
4. **Flexibility**: Handles missing receivers gracefully
5. **Efficiency**: Single transaction for multiple transfers 