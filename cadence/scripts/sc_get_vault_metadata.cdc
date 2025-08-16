import Vaults from "Vaults"

// Get comprehensive vault metadata using MetadataViews
access(all) fun main(org: Address, vaultId: UInt64): {String: AnyStruct} {
    let account = getAccount(org)
    let vaultCollection = account.capabilities.borrow<&Vaults.VaultCollection>(
        Vaults.VaultCollectionPublicPath
    ) ?? panic("Could not borrow vault collection")

    let vault = vaultCollection.borrowVault(id: vaultId)
        ?? panic("Vault not found")

    // Get all available views - Commented out for linting
    // TODO: Re-enable when MetadataViews is properly deployed
    /*
    let views = vault.getViews()
    var metadata: {String: AnyStruct} = {}
    
    // Resolve each view and add to metadata
    for viewType in views {
        if let viewData = vault.resolveView(viewType) {
            metadata[viewType.identifier] = viewData
        }
    }
    */
    var metadata: {String: AnyStruct} = {}
    
    // Add basic vault info
    metadata["basic"] = {
        "id": vault.id,
        "org": vault.org,
        "name": vault.name,
        "description": vault.description,
        "status": vault.status,
        "createdAt": vault.createdAt,
        "participantCount": vault.participants.length,
        "winnerCount": vault.winners.length,
        "totalWinnersAmount": vault.getTotalWinnersAmount()
    }
    
    // Add participants metadata
    var participantsMetadata: [{String: AnyStruct}] = []
    for participant in vault.participants.values {
        participantsMetadata.append({
            "id": participant.id,
            "address": participant.addr,
            "metadata": participant.meta,
            "addedAt": participant.addedAt
        })
    }
    metadata["participants"] = participantsMetadata
    
    // Add winners metadata
    var winnersMetadata: [{String: AnyStruct}] = []
    for winner in vault.winners {
        winnersMetadata.append({
            "participantId": winner.participantId,
            "amount": winner.amount,
            "chainHint": winner.chainHint,
            "tokenHint": winner.tokenHint
        })
    }
    metadata["winners"] = winnersMetadata
    
    return metadata
} 