import Vaults from "Vaults"

transaction(
    orgAddr: Address, 
    vaultId: UInt64, 
    participantId1: UInt64,
    amount1: UFix64,
    participantId2: UInt64,
    amount2: UFix64
) {
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
        
        // Create winners array
        let winners = [
            Vaults.WinnerShare(
                participantId: participantId1,
                amount: amount1,
                chainHint: "flow",
                tokenHint: "USDC"
            ),
            Vaults.WinnerShare(
                participantId: participantId2,
                amount: amount2,
                chainHint: "flow",
                tokenHint: "USDC"
            )
        ]
        
        // Set winners
        vaultRef.setWinners(winners: winners)
        
        log("Winners set successfully")
    }
} 