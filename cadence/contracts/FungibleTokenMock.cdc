// FungibleToken interface following Flow standards
access(all) contract FungibleToken {
    
    access(all) resource interface Vault {
        access(all) var balance: UFix64
        access(all) fun withdraw(amount: UFix64): @{FungibleToken.Vault}
        access(all) fun deposit(from: @{FungibleToken.Vault})
    }
    
    access(all) resource interface Receiver {
        access(all) fun deposit(from: @{FungibleToken.Vault})
    }
    
    access(all) resource interface Provider {
        access(all) fun withdraw(amount: UFix64): @{FungibleToken.Vault}
    }
}