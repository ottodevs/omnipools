# Architecture

## Overview

OmniPools enables one-click prize payouts using Flow Actions with weak guarantees.

## Core Concepts

### Smart Contracts

**Vaults.cdc**
- Manages pools, participants, winners
- Tracks operation IDs for audit trail
- Supports weak guarantees (skip failed transfers)

**Registry.cdc**
- Organization and creator badge management
- Access control for vault operations

### Flow Actions

**Source → Sink Pattern**
```cadence
// tx_payout_split.cdc
transaction(org: Address, vaultId: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        // Withdraw from org vault
        // Deposit to winners with weak guarantees
    }
    execute {
        // Skip failed transfers, log misses
        // Emit PayoutExecuted event
    }
}
```

### Weak Guarantees

If recipient missing capability:
- ✅ Skip transfer (don't revert)
- ✅ Log miss for manual follow-up  
- ✅ Continue with other winners

## Frontend Architecture

### FCL Integration
- Optimized configuration with `config.load()`
- Automatic contract address resolution
- Multi-network support (local/testnet/mainnet)

### Components
- **NetworkProvider**: FCL configuration and network switching
- **FlowConnect**: Wallet connection status
- **TransactionExecutor**: UI-based transaction execution
- **VaultData**: Real-time blockchain data fetching

### Data Flow
1. Scripts query blockchain for vault data
2. UI displays real-time information
3. User executes transactions via FCL
4. Events update UI automatically

## Events & Tracking

```cadence
event PayoutExecuted(
    vaultId: UInt64,
    operationId: UInt64, 
    totalPaid: UFix64
)
```

Operation IDs enable:
- Audit trail of all payouts
- Tracking total amounts paid
- Linking to external receipts
- Analytics and reporting

## Security Model

- **Multi-signature**: Service account holds funds
- **Role-based access**: Operators can execute payouts
- **Audit trail**: All operations logged on-chain
- **Weak guarantees**: Resilient to individual failures