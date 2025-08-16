import Vaults from "Vaults"

// Update vault metadata directly on-chain (no IPFS needed)
transaction(
    org: Address,
    vaultId: UInt64,
    name: String?,
    description: String?,
    logoCID: String?,
    bannerCID: String?,
    externalURL: String?,
    strategyHint: String?
) {
    let vaultCollection: &Vaults.VaultCollection

    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Get org account and borrow vault collection
        let orgAccount = getAccount(org)
        self.vaultCollection = orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
            Vaults.VaultCollectionPublicPath
        ) ?? panic("Could not borrow vault collection from org")
    }

    execute {
        // Borrow vault reference
        let vaultRef = self.vaultCollection.borrowVault(id: vaultId)
            ?? panic("Vault not found")

        // Update metadata fields if provided
        if name != nil { vaultRef.updateName(name: name!) }
        if description != nil { vaultRef.updateDescription(description: description!) }
        if bannerCID != nil { vaultRef.updateBannerCID(bannerCID: bannerCID) }
        if logoCID != nil { vaultRef.updateLogoCID(logoCID: logoCID) }
        if externalURL != nil { vaultRef.updateExternalURL(externalURL: externalURL) }
        if strategyHint != nil { vaultRef.updateStrategyHint(strategyHint: strategyHint) }

        log("Vault metadata updated successfully")

        log("Vault metadata updated successfully")
    }
} 