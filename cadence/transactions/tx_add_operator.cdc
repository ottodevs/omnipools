import Vaults from "Vaults"

transaction(orgAddr: Address, vaultId: UInt64, operatorAddr: Address) {
    let vaultCollection: &Vaults.VaultCollection
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Borrow vault collection from org account
        self.vaultCollection = signer.storage.borrow<&Vaults.VaultCollection>(
            from: Vaults.VaultCollectionStoragePath
        ) ?? panic("Could not borrow vault collection")
    }
    
    execute {
        // Borrow vault reference
        let vaultRef = self.vaultCollection.borrowVault(id: vaultId)
            ?? panic("Vault not found")
        
        // Add operator
        vaultRef.addOperator(addr: operatorAddr)
        
        log("Operator added successfully")
    }
}