import Registry from "Registry"
import Vaults from "Vaults"

transaction(
    name: String,
    kind: UInt8,
    description: String
) {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Setup vault collection for org if not exists
        Vaults.setupVaultCollection(account: signer)
        
        // Borrow vault collection
        let vaultCollection = signer.storage.borrow<&Vaults.VaultCollection>(
            from: Vaults.VaultCollectionStoragePath
        ) ?? panic("Could not borrow vault collection")
        
        // Create simple rails and vault init
        let rails = Vaults.Rails(acceptedIn: ["usdc:flow"], payoutOut: ["usdc:flow"])
        let vaultKind = Vaults.VaultKind(rawValue: kind) ?? panic("Invalid vault kind")
        
        let vaultInit = Vaults.VaultInit(
            name: name,
            kind: vaultKind,
            description: description,
            bannerCID: nil,
            logoCID: nil,
            externalURL: nil,
            rails: rails,
            kyc: nil,
            strategyHint: nil
        )
        
        // Create vault
        let vaultId = vaultCollection.createVault(vaultInit: vaultInit)
        
        log("Vault created with ID: ".concat(vaultId.toString()))
    }
}