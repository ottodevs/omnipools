import FungibleToken from "./FungibleToken.cdc"

/// FungibleTokenConnectors provides Source and Sink connectors for token transfers
/// This enables atomic transfers between different token vaults
access(all) contract FungibleTokenConnectors {
    
    /// Event emitted when a transfer is completed
    access(all) event TransferCompleted(amount: UFix64, from: Address, to: Address)
    
    /// Counter for connector IDs
    access(all) var nextConnectorId: UInt64
    
    /// Resource that represents a source of tokens
    access(all) resource Source {
        access(all) let id: UInt64
        access(all) let vault: &{FungibleToken.Vault}
        
        init(id: UInt64, vault: &{FungibleToken.Vault}) {
            self.id = id
            self.vault = vault
        }
        
        /// Withdraws tokens from the source
        access(all) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            return <-self.vault.withdraw(amount: amount)
        }
        
        /// Gets the available balance in the source
        access(all) fun getBalance(): UFix64 {
            return self.vault.balance
        }
    }
    
    /// Resource that represents a sink for tokens
    access(all) resource Sink {
        access(all) let id: UInt64
        access(all) let receiver: &{FungibleToken.Receiver}
        
        init(id: UInt64, receiver: &{FungibleToken.Receiver}) {
            self.id = id
            self.receiver = receiver
        }
        
        /// Deposits tokens into the sink
        access(all) fun deposit(from: @{FungibleToken.Vault}) {
            self.receiver.deposit(from: <-from)
        }
    }
    
    /// Creates a source from a vault
    access(all) fun createVaultSource(vault: &{FungibleToken.Vault}): @Source {
        let sourceId = self.nextConnectorId
        self.nextConnectorId = self.nextConnectorId + 1
        
        return <-create Source(id: sourceId, vault: vault)
    }
    
    /// Creates a sink from a receiver capability
    access(all) fun createVaultSink(receiver: &{FungibleToken.Receiver}): @Sink {
        let sinkId = self.nextConnectorId
        self.nextConnectorId = self.nextConnectorId + 1
        
        return <-create Sink(id: sinkId, receiver: receiver)
    }
    
    /// Transfers tokens from a source to a sink
    access(all) fun transfer(from: @Source, to: @Sink, amount: UFix64): @Source {
        // Withdraw from source
        let tokens <- from.withdraw(amount: amount)
        
        // Deposit to sink
        to.deposit(from: <-tokens)
        
        emit TransferCompleted(amount: amount, from: from.vault.owner?.address ?? 0x0, to: to.receiver.owner?.address ?? 0x0)
        
        // Destroy the sink since it's consumed
        destroy to
        
        // Return the source for potential reuse
        return <-from
    }
    
    /// Returns a source for reuse (useful when the source is returned by transfer)
    access(all) fun returnSource(): @Source {
        // This is a placeholder - in a real implementation, this would handle
        // returning a source that was consumed by a transfer
        panic("returnSource not implemented in this demo version")
    }
    
    /// Flushes any remaining tokens from a source back to the original vault
    access(all) fun flush(source: @Source) {
        // For this demo, we'll just destroy the source
        destroy source
    }
    
    init() {
        self.nextConnectorId = 1
    }
} 