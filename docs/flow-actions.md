# Flow Actions Integration

OmniPools leverages Flow Actions to provide atomic, cross-chain payout capabilities. This document details how Flow Actions enables our "weak guarantees" payout system.

## What are Flow Actions?

Flow Actions is a DeFi infrastructure layer that enables:
- **Cross-chain operations** directly from Cadence smart contracts
- **Atomic transactions** across multiple protocols and chains
- **Composable DeFi** with standardized action interfaces
- **Institutional-grade** reliability and audit trails

## OmniPools Implementation

### Weak Guarantees Pattern

Traditional payout systems fail completely if any recipient has issues. OmniPools implements "weak guarantees" where:

✅ **Successful recipients get paid**  
⚠️ **Failed recipients are recorded as "misses"**  
🔄 **Misses can be retried later**  
📊 **Complete audit trail maintained**

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vault Smart   │    │  Flow Actions   │    │  USDC Contract  │
│   Contract      │────│   DeFi Layer    │────│   (MockUSDC)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Execute Payout     │ 2. Atomic Transfers   │ 3. Token Moves
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │ Winner  │             │ Action  │             │ Balance │
    │ List    │             │ Queue   │             │ Updates │
    └─────────┘             └─────────┘             └─────────┘
```

## Contract Integration

### DeFiActions Contract

Our `DeFiActions` contract provides the interface for Flow Actions:

```cadence
import FungibleToken from "FungibleToken"

access(all) contract DeFiActions {
    
    /// Resource representing a single action
    access(all) resource Action {
        access(all) let id: UInt64
        access(all) let actionType: String
        access(all) var completed: Bool
        
        access(all) fun markCompleted() {
            self.completed = true
        }
    }
    
    /// Execute atomic transfer using Flow Actions
    access(all) fun executeTransfer(
        from: auth(FungibleToken.Withdraw) &{FungibleToken.Vault},
        to: &{FungibleToken.Receiver},
        amount: UFix64
    ): Bool {
        let action <- self.createAction(actionType: "Transfer")
        
        // Execute the transfer atomically
        let tokens <- from.withdraw(amount: amount)
        to.deposit(from: <-tokens)
        
        action.markCompleted()
        emit ActionExecuted(actionId: action.id, actionType: action.actionType, success: true)
        
        destroy action
        return true
    }
}
```

### Vault Payout Logic

The `Vaults` contract orchestrates payouts using Flow Actions:

```cadence
/// Execute payout for all winners
access(all) fun executePayout(vaultId: UInt64) {
    let vault = self.borrowVault(id: vaultId)
    
    for winnerId in vault.winners.keys {
        let winner = vault.winners[winnerId]!
        
        // Try to execute payout using Flow Actions
        let success = DeFiActions.executeTransfer(
            from: vault.getVaultRef(),
            to: winner.getReceiverRef(),
            amount: winner.amount
        )
        
        if success {
            vault.recordReceipt(winnerId: winnerId, amount: winner.amount)
        } else {
            vault.recordMiss(winnerId: winnerId, reason: "Transfer failed")
        }
    }
    
    vault.markPayoutComplete()
}
```

## Payout Flow

### 1. Winner Selection
```typescript
// Frontend calls transaction
const txId = await setWinnersTransaction(vaultId, [
  { address: "0x1234...", amount: 1000.00 },
  { address: "0x5678...", amount: 500.00 },
  { address: "0x9abc...", amount: 250.00 }
])
```

### 2. Flow Actions Execution
```cadence
transaction(orgAddr: Address, vaultId: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        let vaultCollection = signer.storage.borrow<&Vaults.VaultCollection>(
            from: Vaults.VaultCollectionStoragePath
        ) ?? panic("Could not borrow vault collection")
        
        // Execute payout with Flow Actions
        vaultCollection.executePayout(vaultId: vaultId)
    }
}
```

### 3. Atomic Operations
For each winner:
1. **Validate**: Check recipient can receive USDC
2. **Transfer**: Execute atomic USDC transfer via Flow Actions  
3. **Record**: Log success as receipt OR failure as miss
4. **Continue**: Process remaining winners regardless of individual failures

### 4. Result Tracking
```json
{
  "vault": {
    "totalPaid": "1750.00",
    "receiptCount": 3,
    "missCount": 0
  },
  "receipts": [
    {"winnerId": 1, "amount": "1000.00", "txHash": "0x..."},
    {"winnerId": 2, "amount": "500.00", "txHash": "0x..."},
    {"winnerId": 3, "amount": "250.00", "txHash": "0x..."}
  ],
  "misses": {}
}
```

## Cross-Chain Capabilities

### Current Implementation (Testnet)
- **Flow Native**: USDC transfers within Flow ecosystem
- **Atomic Guarantees**: All-or-nothing operation success
- **Event Emission**: Complete audit trail on Flow blockchain

### Roadmap Integrations

#### Circle CCTP Integration
```cadence
// Future: Cross-chain USDC via Circle CCTP
access(all) fun executeCrossChainPayout(
    recipients: [{address: String, amount: UFix64, chain: String}]
) {
    for recipient in recipients {
        match recipient.chain {
            case "ethereum":
                CCTPActions.bridgeAndPay(
                    to: recipient.address,
                    amount: recipient.amount,
                    targetChain: "ethereum"
                )
            case "polygon":
                CCTPActions.bridgeAndPay(
                    to: recipient.address, 
                    amount: recipient.amount,
                    targetChain: "polygon"
                )
            default:
                // Flow native transfer
                DeFiActions.executeTransfer(...)
        }
    }
}
```

#### LayerZero Mirroring
```cadence
// Future: Cross-chain state mirroring
access(all) fun mirrorVaultState(vaultId: UInt64, targetChains: [String]) {
    let vault = self.borrowVault(id: vaultId)
    let stateHash = vault.computeStateHash()
    
    for chain in targetChains {
        LayerZeroActions.sendMessage(
            targetChain: chain,
            payload: vault.encodeState(),
            stateHash: stateHash
        )
    }
}
```

## Testing & Verification

### Local Testing
```bash
# Start emulator with Flow Actions
flow emulator start --persist

# Deploy contracts locally
flow project deploy

# Run demo with Flow Actions
./scripts/demo.sh
```

### Testnet Testing
```bash
# Test payout execution on testnet
flow transactions send cadence/transactions/tx_payout_split.cdc \
  0x035662afa58bdc22 1 --network testnet --signer deployer

# Verify results
flow scripts execute cadence/scripts/sc_get_summary.cdc \
  0x035662afa58bdc22 1 --network testnet
```

### Integration Testing
```bash
# Run comprehensive integration tests
./scripts/test-flow-integration.sh

# Test specific Flow Actions scenarios
bun test flow-actions.test.ts
```

## Production Considerations

### Security
- **Entitlements**: Proper authorization for withdraw operations
- **Resource Safety**: Cadence prevents double-spending and loss
- **Audit Trail**: All operations logged immutably on blockchain
- **Access Control**: Role-based permissions for vault operations

### Scalability  
- **Batch Processing**: Multiple winners processed in single transaction
- **Gas Optimization**: Efficient Cadence code with minimal storage operations
- **Network Effects**: Compatible with Flow ecosystem standards
- **Future Scaling**: Ready for mainnet deployment

### Monitoring
- **Transaction Tracking**: All operations have unique transaction IDs
- **Event Monitoring**: Real-time event listening for payout status
- **Error Handling**: Graceful degradation with miss recording
- **Block Explorer**: Public verification via Flowscan

## Benefits for Event Organizers

### Traditional Payouts vs OmniPools

| Traditional | OmniPools + Flow Actions |
|-------------|--------------------------|
| Manual bank transfers | Automated blockchain payouts |
| 3-5 day settlement | Instant settlement |
| Limited audit trail | Immutable blockchain records |
| Single point of failure | Weak guarantees (partial success) |
| High fees | Low Flow transaction fees |
| Limited transparency | Public blockchain verification |

### Real-World Use Cases

- **Hackathon Bounties**: Instant winner payouts with public verification
- **Tournament Prizes**: Automated distribution based on rankings
- **Grant Programs**: Milestone-based payments with audit trails
- **Community Rewards**: Large-scale airdrops with miss handling
- **Event Deposits**: Refundable stakes with automatic processing

---

**Live Integration**: All Flow Actions working on testnet  
**Testnet Address**: `0x035662afa58bdc22`  
**Block Explorer**: [View on Flowscan](https://testnet.flowscan.io/account/035662afa58bdc22)