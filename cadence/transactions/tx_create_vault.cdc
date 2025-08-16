import Registry from "Registry"
import Vaults from "Vaults"

transaction(
    orgAddr: Address,
    name: String,
    kind: UInt8,
    description: String,
    bannerCID: String?,
    logoCID: String?,
    externalURL: String?,
    acceptedIn: [String],
    payoutOut: [String],
    kycThresholdUsd: UFix64?,
    strategyHint: String?
) {
    let orgAccount: &Account
    let vaultCollection: &Vaults.VaultCollection
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Get org account
        self.orgAccount = getAccount(orgAddr)
        
        // Setup vault collection for org if not exists
        Vaults.setupVaultCollection(account: signer)
        
        // Borrow vault collection
        self.vaultCollection = signer.storage.borrow<&Vaults.VaultCollection>(
            from: Vaults.VaultCollectionStoragePath
        ) ?? panic("Could not borrow vault collection")
    }
    
    execute {
        // Create rails
        let rails = Vaults.Rails(acceptedIn: acceptedIn, payoutOut: payoutOut)
        
        // Create KYC if threshold provided
        let kyc = kycThresholdUsd != nil ? Vaults.KYC(thresholdUsd: kycThresholdUsd) : nil
        
        // Create vault kind enum
        let vaultKind = Vaults.VaultKind(rawValue: kind) ?? panic("Invalid vault kind")
        
        // Create vault init struct
        let vaultInit = Vaults.VaultInit(
            name: name,
            kind: vaultKind,
            description: description,
            bannerCID: bannerCID,
            logoCID: logoCID,
            externalURL: externalURL,
            rails: rails,
            kyc: kyc,
            strategyHint: strategyHint
        )
        
        // Create vault
        let vaultId = self.vaultCollection.createVault(vaultInit: vaultInit)
        
        log("Vault created with ID: ".concat(vaultId.toString()))
    }
}