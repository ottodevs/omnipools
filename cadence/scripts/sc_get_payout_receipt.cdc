import Vaults from "Vaults"

// Get payout receipt information for a specific vault and operation
access(all) fun main(org: Address, vaultId: UInt64, opId: UInt64): {String: AnyStruct} {
    let account = getAccount(org)
    let vaultCollection = account.capabilities.borrow<&Vaults.VaultCollection>(
        Vaults.VaultCollectionPublicPath
    ) ?? panic("Could not borrow vault collection")
    
    let vault = vaultCollection.borrowVault(id: vaultId)
        ?? panic("Vault not found")
    
    let summary = vault.getSummary()
    
    return {
        "vaultId": vaultId,
        "operationId": opId,
        "status": vault.getStatus(),
        "totalWinners": summary["totalWinners"] as! UFix64,
        "lastOperationId": summary["lastOperationId"] as! UInt64,
        "participantCount": summary["participantCount"] as! Int,
        "winnerCount": vault.getWinners().length
    }
} 