import Vaults from "Vaults"

access(all) fun main(orgAddr: Address, vaultId: UInt64): {String: AnyStruct}? {
    let orgAccount = getAccount(orgAddr)
    
    if let collectionRef = orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
        Vaults.VaultCollectionPublicPath
    ) {
        if let vaultRef = collectionRef.borrowVaultPublic(id: vaultId) {
            let summary = vaultRef.getSummary()
            
            // Add additional summary information
            let participants = vaultRef.getParticipants()
            let winners = vaultRef.getWinners()
            let fundingNotes = vaultRef.getFundingNotes()
            let receipts = vaultRef.getReceipts()
            
            // Calculate totals
            var totalFundingAmount: UFix64 = 0.0
            for note in fundingNotes {
                if let amountStr = note["amount"] {
                    totalFundingAmount = totalFundingAmount + (UFix64.fromString(amountStr) ?? 0.0)
                }
            }
            
            var totalWinnerAmount: UFix64 = 0.0
            for winner in winners {
                totalWinnerAmount = totalWinnerAmount + winner.amount
            }
            
            var totalReceiptAmount: UFix64 = 0.0
            for receipt in receipts {
                if let amountStr = receipt["amount"] {
                    totalReceiptAmount = totalReceiptAmount + (UFix64.fromString(amountStr) ?? 0.0)
                }
            }
            
            // Enhanced summary
            let enhancedSummary: {String: AnyStruct} = {
                "vault": summary,
                "totals": {
                    "funding": totalFundingAmount,
                    "winners": totalWinnerAmount,
                    "receipts": totalReceiptAmount
                },
                "counts": {
                    "participants": participants.length,
                    "winners": winners.length,
                    "fundingNotes": fundingNotes.length,
                    "receipts": receipts.length
                },
                "lastUpdated": getCurrentBlock().timestamp
            }
            
            return enhancedSummary
        }
    }
    
    return nil
}