// Mock FungibleToken contract for development/testing
access(all) contract FungibleToken {
    
    access(all) resource interface Vault {
        access(all) var balance: UFix64
        access(all) fun withdraw(amount: UFix64): @{Vault}
        access(all) fun deposit(from: @{Vault})
    }
    
    access(all) resource interface Receiver {
        access(all) fun deposit(from: @{Vault})
    }
    
    access(all) resource interface Provider {
        access(all) fun withdraw(amount: UFix64): @{Vault}
    }
}