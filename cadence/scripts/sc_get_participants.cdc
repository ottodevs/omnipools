import Vaults from "Vaults"

access(all) fun main(orgAddr: Address, vaultId: UInt64): [Vaults.Participant] {
    let orgAccount = getAccount(orgAddr)
    
    if let collectionRef = orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
        Vaults.VaultCollectionPublicPath
    ) {
        if let vaultRef = collectionRef.borrowVaultPublic(id: vaultId) {
            return vaultRef.getParticipants()
        }
    }
    
    return []
}