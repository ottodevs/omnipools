import FungibleToken from "FungibleToken"
import Vaults from "Vaults"

// Params: org address (owner of the USDC source) + vaultId
transaction(org: Address, vaultId: UInt64) {

    // Local handles
    let orgUSDCVault: &{FungibleToken.Vault}
    let vaultRef: &Vaults.Vault
    let opId: UInt64

    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Borrow the USDC source vault from org storage
        self.orgUSDCVault = signer.storage.borrow<&{FungibleToken.Vault}>(
            from: /storage/USDCVault
        ) ?? panic("Could not borrow org USDC vault")

        // Get org account and borrow vault collection
        let orgAccount = getAccount(org)
        let vaultCollection = orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
            Vaults.VaultCollectionPublicPath
        ) ?? panic("Could not borrow vault collection from org")
        
        // Borrow vault reference
        self.vaultRef = vaultCollection.borrowVault(id: vaultId)
            ?? panic("Vault not found")

        // Get next op id
        self.opId = self.vaultRef.getNextOperationId()
    }

    execute {
        var totalPaid: UFix64 = 0.0
        let misses: {Address: UFix64} = {}

        // Iterate winners stored in the Vault
        let winners = self.vaultRef.getFlowUSDCWinners() // helper returning only (addr, amount) for Flow/USDC
        for w in winners {
            let recipientAccount = getAccount(w.addr)
            let receiver = recipientAccount.capabilities.borrow<&{FungibleToken.Receiver}>(
                /public/USDCReceiver
            )

            if receiver == nil {
                // weak guarantee: skip, record miss
                misses[w.addr] = w.amount
                continue
            }

            // Withdraw tokens from org vault
            let tokens <- self.orgUSDCVault.withdraw(amount: w.amount)
            
            // Deposit to recipient
            receiver!.deposit(from: <-tokens)

            totalPaid = totalPaid + w.amount
        }

        // Mark paid & emit event with opId + total
        self.vaultRef.markPaidWithDetails(opId: self.opId, totalPaid: totalPaid, misses: misses)
    }
}