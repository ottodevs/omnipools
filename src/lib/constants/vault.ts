// Demo organization address (configurable via env)
export const DEMO_ORG_ADDRESS = process.env.NEXT_PUBLIC_DEMO_ORG_ADDRESS || "0xf8d6e0586b0a20c7";

/**
 * Optimized Cadence transactions
 * Using simple imports thanks to config.load() with flow.json
 */
export const CADENCE_TRANSACTIONS = {
  payoutSplit: `
    import Vaults from 0xVaults

    transaction(orgAddr: Address, vaultId: UInt64) {
        let vaultCollection: &Vaults.VaultCollection?
        let vault: &{Vaults.IVaultPublic}?
        
        prepare(signer: auth(Storage) &Account) {
            // Get org account and try to borrow vault collection
            let orgAccount = getAccount(orgAddr)
            self.vaultCollection = orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
                Vaults.VaultCollectionPublicPath
            )
            
            // Try to get vault reference
            if let collection = self.vaultCollection {
                self.vault = collection.borrowVaultPublic(id: vaultId)
            }
        }
        
        execute {
            // Check if we have valid references
            if self.vaultCollection == nil {
                panic("Could not borrow vault collection from org ".concat(orgAddr.toString()))
            }
            
            if self.vault == nil {
                panic("Vault ".concat(vaultId.toString()).concat(" not found in org ").concat(orgAddr.toString()))
            }
            
            // For demo: just log the payout execution
            // In real implementation, this would trigger the actual USDC transfer
            log("🚀 Payout executed for vault ".concat(vaultId.toString()).concat(" from org ").concat(orgAddr.toString()))
            log("📊 Vault status: ".concat(self.vault!.getStatus()))
            log("🏆 Winner count: ".concat(self.vault!.getWinners().length.toString()))
            log("💰 Next operation ID: ".concat(self.vault!.getNextOperationId().toString()))
            
            // This is a demonstration transaction - it doesn't actually move funds
            // The real payout would need to be executed by the service account with proper storage access
        }
    }
  `,
  
  addParticipant: `
    import Vaults from 0xVaults

    transaction(orgAddr: Address, vaultId: UInt64, participantAddr: Address, meta: {String: String}) {
        let orgAccount: &Account
        let vaultCollection: &Vaults.VaultCollection
        let vault: &Vaults.Vault
        
        prepare(acct: auth(Storage) &Account) {
            self.orgAccount = getAccount(orgAddr)
            self.vaultCollection = self.orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
                Vaults.VaultCollectionPublicPath
            ) ?? panic("Vault collection not found")
            
            self.vault = self.vaultCollection.borrowVaultPublic(id: vaultId) ?? panic("Vault not found")
        }
        
        execute {
            log("Adding participant ".concat(participantAddr.toString()).concat(" to vault ").concat(vaultId.toString()))
        }
    }
  `,
  
  setWinners: `
    import Vaults from 0xVaults

    transaction(orgAddr: Address, vaultId: UInt64) {
        let orgAccount: &Account
        let vaultCollection: &Vaults.VaultCollection
        let vault: &Vaults.Vault
        
        prepare(acct: auth(Storage) &Account) {
            self.orgAccount = getAccount(orgAddr)
            self.vaultCollection = self.orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
                Vaults.VaultCollectionPublicPath
            ) ?? panic("Vault collection not found")
            
            self.vault = self.vaultCollection.borrowVaultPublic(id: vaultId) ?? panic("Vault not found")
        }
        
        execute {
            log("Setting winners for vault ".concat(vaultId.toString()))
        }
    }
  `
}; 