# Flow Blockchain Integration

TrustFlow leverages Flow blockchain's unique capabilities to provide atomic, audit-ready payouts for events. This document details our Flow integration, contract architecture, and deployment strategy.

## Why Flow?

Flow was chosen for TrustFlow because of its:

- **Resource-Oriented Programming**: Cadence's resource system ensures digital assets can't be duplicated or lost
- **Built-in Account Abstraction**: Native account linking and hybrid custody for seamless UX
- **Atomic Transactions**: Multi-step operations execute atomically or fail completely
- **Production Scale**: Powers NBA Top Shot and other major applications
- **Developer Experience**: Excellent tooling, emulator, and testing framework

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Flow Actions  │    │ Flow Blockchain │
│   (Next.js)     │────│   (DeFi)        │────│   (Cadence)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │ FCL SDK │             │ Token   │             │ Smart   │
    │         │             │ Swaps   │             │ Contracts│
    └─────────┘             └─────────┘             └─────────┘
```

## Smart Contract Architecture

### Core Contracts

#### 1. Registry Contract
**Purpose**: Organization and vault registry
**Location**: `cadence/contracts/Registry.cdc`
**Address**: `0x035662afa58bdc22` (Testnet)

```cadence
// Key functions
access(all) fun setupOrgAccount(account: &Account, name: String, logoCID: String?)
access(all) fun getOrgInfo(orgAddr: Address): OrgInfo?
```

#### 2. Vaults Contract  
**Purpose**: Core vault management and payout logic
**Location**: `cadence/contracts/Vaults.cdc`
**Address**: `0x035662afa58bdc22` (Testnet)

```cadence
// Key resources
access(all) resource Vault {
    access(all) let id: UInt64
    access(all) var status: String
    access(all) var winners: {UInt64: Winner}
    access(all) var funding: {String: UFix64}
}

access(all) resource VaultCollection {
    access(all) fun createVault(/* params */): UInt64
    access(all) fun setWinners(vaultId: UInt64, winners: [Winner])
    access(all) fun executePayout(vaultId: UInt64)
}
```

#### 3. MockUSDC Contract
**Purpose**: USDC token implementation for testing
**Location**: `cadence/contracts/MockUSDC.cdc`  
**Address**: `0x035662afa58bdc22` (Testnet)

```cadence
// Cadence 1.0 compliant FungibleToken implementation
access(all) resource Vault: FungibleToken.Vault {
    access(all) var balance: UFix64
    access(FungibleToken.Withdraw) fun withdraw(amount: UFix64): @{FungibleToken.Vault}
    access(all) fun deposit(from: @{FungibleToken.Vault})
    access(all) view fun isAvailableToWithdraw(amount: UFix64): Bool
}
```

#### 4. DeFiActions Contract
**Purpose**: Flow Actions integration for cross-chain operations
**Location**: `cadence/vendor/DeFiActions.cdc`
**Address**: `0x035662afa58bdc22` (Testnet)

```cadence
// Atomic transfer operations
access(all) fun executeTransfer(
    from: auth(FungibleToken.Withdraw) &{FungibleToken.Vault},
    to: &{FungibleToken.Receiver}, 
    amount: UFix64
): Bool
```

## Flow Actions Integration

Flow Actions enables cross-chain DeFi operations directly from Cadence smart contracts. TrustFlow uses this for:

### Automated Payouts
```cadence
// Execute payout using Flow Actions
transaction(orgAddr: Address, vaultId: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        let vaultCollection = signer.storage.borrow<&Vaults.VaultCollection>(
            from: Vaults.VaultCollectionStoragePath
        ) ?? panic("Could not borrow vault collection")
        
        let vault = vaultCollection.borrowVault(id: vaultId)
        
        // Use Flow Actions for atomic payout execution
        DeFiActions.executeTransfer(
            from: vault.getVaultRef(),
            to: winnerReceiver,
            amount: payoutAmount
        )
    }
}
```

### Cross-Chain Token Bridges
- **USDC Bridging**: Seamless USDC transfers between Flow and other chains
- **Multi-Chain Support**: Extend to Ethereum, Polygon, and other EVM chains
- **Atomic Operations**: Ensure payouts complete or fail entirely

## Deployment Process

### Testnet Deployment (Production Ready)

#### 1. Account Setup
```bash
# Create testnet account
flow accounts create --network testnet
# Account created: 0x035662afa58bdc22

# Fund account via faucet
curl -X POST "https://testnet-faucet.onflow.org/fund-account" \
  -H "Content-Type: application/json" \
  -d '{"address":"035662afa58bdc22"}'
```

#### 2. Contract Deployment
```bash
# Deploy all contracts to testnet
flow project deploy --network testnet

# Verify deployment
flow accounts get 035662afa58bdc22 --network testnet
```

#### 3. Initialization
```bash
# Create organization
flow transactions send cadence/transactions/tx_create_org.cdc "TrustFlow Demo" \
  --network testnet --signer deployer

# Setup USDC infrastructure  
flow transactions send cadence/transactions/tx_setup_minter.cdc \
  --network testnet --signer deployer
flow transactions send cadence/transactions/tx_link_usdc_receiver.cdc \
  --network testnet --signer deployer

# Mint initial USDC for testing
flow transactions send cadence/transactions/tx_mint_or_fund_usdc.cdc \
  0x035662afa58bdc22 "5000.00" --network testnet --signer deployer
```

### Production Addresses

| Contract | Testnet Address | Mainnet Address |
|----------|----------------|-----------------|
| Registry | `0x035662afa58bdc22` | TBD |
| Vaults | `0x035662afa58bdc22` | TBD |
| MockUSDC | `0x035662afa58bdc22` | Use real USDC |
| DeFiActions | `0x035662afa58bdc22` | TBD |
| FungibleTokenConnectors | `0x035662afa58bdc22` | TBD |

## Testing & Verification

### Contract Testing
```bash
# Run Cadence unit tests
flow test

# Integration testing
./scripts/test-flow-integration.sh

# Demo full flow
./scripts/demo.sh
```

### Testnet Verification
```bash
# Query deployed vault
flow scripts execute cadence/scripts/sc_get_vault.cdc 0x035662afa58bdc22 1 --network testnet

# Check vault summary  
flow scripts execute cadence/scripts/sc_get_summary.cdc 0x035662afa58bdc22 1 --network testnet

# Verify USDC balance
flow scripts execute cadence/scripts/sc_get_winner_balance.cdc 0x035662afa58bdc22 --network testnet
```

### Live Demo Results
✅ **Vault Created**: ID 1, "ETHGlobal NY Production Test"  
✅ **USDC Minted**: 5,000 USDC available for payouts  
✅ **Organization Setup**: Registry initialized  
✅ **Capabilities Linked**: Receiver and provider capabilities configured  

## Security & Best Practices

### Key Management
- ✅ Private keys stored securely in `.pkey` files (gitignored)
- ✅ Testnet account funded through official faucet
- ✅ Production deployment uses proper environment variables

### Contract Security
- ✅ Cadence 1.0 compliant with proper authorization
- ✅ Resource-oriented programming prevents double-spending
- ✅ Entitlements protect privileged functions
- ✅ Standard interfaces ensure composability

### Audit Trail
- ✅ All transactions logged on Flow blockchain
- ✅ Events emitted for vault creation, winner selection, payouts
- ✅ Block explorer links for transparency
- ✅ Immutable record of all operations

## Flow Ecosystem Integration

### Standard Compliance
- ✅ **FungibleToken Standard**: Full Cadence 1.0 compliance
- ✅ **MetadataViews**: Standard metadata for discoverability  
- ✅ **ViewResolver**: Composable metadata resolution
- ✅ **Burner Standard**: Proper token destruction handling

### Wallet Compatibility
- ✅ **FCL Integration**: Works with all Flow wallets
- ✅ **WalletConnect**: Cross-platform wallet support
- ✅ **Dev Wallet**: Development and testing support
- ✅ **Mobile Wallets**: Production-ready mobile experience

### Developer Experience
- ✅ **Flow CLI**: Complete toolchain integration
- ✅ **Emulator**: Local development environment
- ✅ **Testing Framework**: Comprehensive test coverage
- ✅ **Block Explorer**: Transaction verification and debugging

## Next Steps

### Mainnet Deployment
1. **Security Audit**: Professional smart contract audit
2. **Key Management**: Production-grade key storage (Google KMS, etc.)
3. **Real USDC**: Replace MockUSDC with official USDC contract
4. **Monitoring**: Set up transaction monitoring and alerting

### Scaling
1. **Multi-Chain**: Extend to other Flow-connected chains
2. **Enterprise**: Support for large-scale events and organizations
3. **Governance**: Decentralized governance for protocol upgrades
4. **Analytics**: Advanced reporting and analytics dashboard

---

**Live Testnet Demo**: All contracts deployed and verified at `0x035662afa58bdc22`  
**Block Explorer**: [View on Flowscan](https://testnet.flowscan.io/account/035662afa58bdc22)  
**Documentation**: See `/docs` folder for complete technical documentation