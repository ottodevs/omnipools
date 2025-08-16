import Vaults from "Vaults"

transaction(orgAddr: Address, vaultId: UInt64, participantAddr: Address, meta: {String: String}) {
    let vaultCollection: &Vaults.VaultCollection
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Get org account and borrow vault collection
        let orgAccount = getAccount(orgAddr)
        self.vaultCollection = orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
            Vaults.VaultCollectionPublicPath
        ) ?? panic("Could not borrow vault collection from org")
    }
    
    execute {
        // Borrow vault reference
        let vaultRef = self.vaultCollection.borrowVault(id: vaultId)
            ?? panic("Vault not found")
        
        // Add participant
        vaultRef.addParticipant(addr: participantAddr, meta: meta)
        
        log("Participant added successfully")
    }
}