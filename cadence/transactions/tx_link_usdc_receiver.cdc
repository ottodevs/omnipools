import FungibleToken from "FungibleToken"
import MockUSDC from "MockUSDC"

// Transaction to set up USDC vault and link receiver capability for the signer
transaction() {
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Check if the signer already has a USDC vault
        if signer.storage.borrow<&MockUSDC.Vault>(from: MockUSDC.VaultStoragePath) == nil {
            // Create a new empty vault
            let vault <- MockUSDC.createEmptyVault(vaultType: Type<@MockUSDC.Vault>())
            
            // Store it in the signer's storage
            signer.storage.save(<-vault, to: MockUSDC.VaultStoragePath)
            
            // Create a public capability for the vault
            let receiverCapability = signer.capabilities.storage.issue<&{FungibleToken.Receiver}>(MockUSDC.VaultStoragePath)
            signer.capabilities.publish(receiverCapability, at: MockUSDC.VaultPublicPath)
        }
    }
    
    execute {
        log("USDC receiver linked for account")
    }
}