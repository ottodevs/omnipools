/// FungibleToken defines a contract that contains the minimum interface
/// that a fungible token contract must implement.
access(all) contract FungibleToken {
    /// Event that is emitted when tokens are withdrawn from a Vault
    access(all) event TokensWithdrawn(amount: UFix64, from: Address?)

    /// Event that is emitted when tokens are deposited to a Vault
    access(all) event TokensDeposited(amount: UFix64, to: Address?)

    /// Event that is emitted when tokens are transferred from one account to another
    access(all) event TokensTransferred(amount: UFix64, from: Address?, to: Address?)

    /// Resource that represents the ability to withdraw tokens
    /// from a Vault and destroy them.
    access(all) resource interface Provider {
        /// The amount of tokens that can be withdrawn from the Vault
        access(all) fun availableBalance(): UFix64

        /// Withdraws `amount` tokens from the Vault and destroys them.
        access(all) fun withdraw(amount: UFix64): @{FungibleToken.Vault}

        /// Destroys the vault and returns the tokens that were in it.
        access(all) fun destroyEmpty()
    }

    /// Resource that represents a place where tokens can be stored.
    access(all) resource interface Vault {
        /// The total balance of tokens in the Vault
        access(all) var balance: UFix64

        /// The total balance of tokens that can be withdrawn from the Vault
        access(all) fun availableBalance(): UFix64

        /// Withdraws `amount` tokens from the Vault and returns them as a new Vault
        access(all) fun withdraw(amount: UFix64): @{FungibleToken.Vault}

        /// Takes tokens from a `from` vault and deposits them into this vault
        access(all) fun deposit(from: @{FungibleToken.Vault})
    }

    /// Resource that represents the ability to receive tokens.
    access(all) resource interface Receiver {
        /// Adds tokens to the initial receiver's Vault
        access(all) fun deposit(from: @{FungibleToken.Vault})
    }

    /// Resource that represents the ability to transfer tokens.
    access(all) resource interface Transferer {
        /// Transfers `amount` tokens from the `from` vault to the `to` receiver
        access(all) fun transfer(amount: UFix64, from: @{FungibleToken.Vault}, to: &{FungibleToken.Receiver})
    }
} 