import Vaults from "Vaults"

transaction(orgAddr: Address, vaultId: UInt64) {
    let vaultCollection: &Vaults.VaultCollection
    let vaultRef: &Vaults.Vault
    let operationId: UInt64
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Get org account and borrow vault collection
        let orgAccount = getAccount(orgAddr)
        self.vaultCollection = orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
            Vaults.VaultCollectionPublicPath
        ) ?? panic("Could not borrow vault collection from org")
        
        // Borrow vault reference
        self.vaultRef = self.vaultCollection.borrowVault(id: vaultId)
            ?? panic("Vault not found")
        
        // Get next operation ID
        self.operationId = self.vaultRef.getNextOperationId()
    }
    
    execute {
        // Get winners from vault
        let winners = self.vaultRef.getWinners()
        var totalAmount: UFix64 = 0.0
        var processedWinners: [String] = []
        
        // Process each winner (simplified - just log the payout info)
        for winner in winners {
            // Get participant info
            let participants = self.vaultRef.getParticipants()
            var participantAddr: Address? = nil
            
            for participant in participants {
                if participant.id == winner.participantId {
                    participantAddr = participant.addr
                    break
                }
            }
            
            if participantAddr != nil {
                totalAmount = totalAmount + winner.amount
                processedWinners.append("Winner ".concat(winner.participantId.toString()).concat(": ").concat(winner.amount.toString()).concat(" ").concat(winner.tokenHint).concat(" to ").concat(participantAddr!.toString()))
                
                log("Payout planned: ".concat(winner.amount.toString()).concat(" ").concat(winner.tokenHint).concat(" to ").concat(participantAddr!.toString()))
            } else {
                log("Warning: Participant ".concat(winner.participantId.toString()).concat(" not found"))
            }
        }
        
        // Mark vault as paid if any winners were processed
        if totalAmount > 0.0 {
            self.vaultRef.markPaid()
            log("Vault marked as paid. Total amount: ".concat(totalAmount.toString()))
        }
        
        log("Payout planning completed. Processed ".concat(processedWinners.length.toString()).concat(" winners"))
        log("Operation ID: ".concat(self.operationId.toString()))
    }
} 