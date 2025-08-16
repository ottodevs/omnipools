import FungibleToken from "FungibleToken"
// import FiatToken from "../contracts/FiatTokenMock.cdc"
import Vaults from "Vaults"

// Note: DeFi Actions and FungibleTokenConnectors imports would be added when available
// import DeFiActions from "DeFiActions"
// import FungibleTokenConnectors from "FungibleTokenConnectors"

transaction(orgAddr: Address, vaultId: UInt64) {
    let vaultCollection: &Vaults.VaultCollection
    let orgUSDCVault: &{FungibleToken.Vault}
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
        
        // Borrow org's USDC vault (assuming standard USDC storage path)
        // In a real implementation, this would be more flexible based on token type
        self.orgUSDCVault = signer.storage.borrow<&{FungibleToken.Vault}>(
            from: /storage/USDCVault
        ) ?? panic("Could not borrow org USDC vault")
    }
    
    execute {
        // Get winners from vault
        let winners = self.vaultRef.getWinners()
        var totalPaid: UFix64 = 0.0
        var missedPayouts: [String] = []
        
        // Process each winner
        for winner in winners {
            // Only process Flow USDC payouts
            if winner.chainHint == "flow" && winner.tokenHint == "USDC" {
                
                // Get participant info
                let participants = self.vaultRef.getParticipants()
                var participantAddr: Address? = nil
                
                for participant in participants {
                    if participant.id == winner.participantId {
                        participantAddr = participant.addr
                        break
                    }
                }
                
                if participantAddr == nil {
                    missedPayouts.append("Participant ".concat(winner.participantId.toString()).concat(" not found"))
                    continue
                }
                
                // Try to get recipient's USDC receiver capability
                let recipientAccount = getAccount(participantAddr!)
                let receiver = recipientAccount.capabilities.borrow<&{FungibleToken.Receiver}>(
                    /public/USDCReceiver
                )
                
                if receiver == nil {
                    // Weak guarantee: skip and log miss instead of reverting
                    missedPayouts.append("Recipient ".concat(participantAddr!.toString()).concat(" missing USDC receiver"))
                    continue
                }
                
                // Withdraw tokens from org vault
                let tokens <- self.orgUSDCVault.withdraw(amount: winner.amount)
                
                // Deposit to recipient
                receiver!.deposit(from: <-tokens)
                
                totalPaid = totalPaid + winner.amount
                
                log("Paid ".concat(winner.amount.toString()).concat(" USDC to ").concat(participantAddr!.toString()))
            } else {
                // Skip non-Flow or non-USDC payouts for this implementation
                missedPayouts.append("Unsupported payout: ".concat(winner.chainHint).concat("/").concat(winner.tokenHint))
            }
        }
        
        // Update vault status to paid if any payments were made
        if totalPaid > 0.0 {
            self.vaultRef.setStatus(status: "Paid")
        }
        
        // Log missed payouts for transparency
        if missedPayouts.length > 0 {
            log("Missed payouts: ".concat(missedPayouts.length.toString()))
            for miss in missedPayouts {
                log("Miss: ".concat(miss))
            }
        }
        
        log("Payout completed. Total paid: ".concat(totalPaid.toString()).concat(" USDC"))
        log("Operation ID: ".concat(self.operationId.toString()))
    }
    
    post {
        // Emit event manually since we're not using the vault's markPaid function
        // In a real implementation with DeFi Actions, this would be handled by the Actions framework
        // Note: totalPaid is not accessible in post condition, so we emit without it
        // emit Vaults.PayoutExecuted(vaultId: vaultId, operationId: self.operationId, totalPaid: totalPaid)
    }
}