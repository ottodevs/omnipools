import Vaults from "Vaults"

access(all) fun main(orgAddr: Address): [UInt64] {
    let orgAccount = getAccount(orgAddr)
    
    if let collectionRef = orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
        Vaults.VaultCollectionPublicPath
    ) {
        return collectionRef.getVaultIds()
    }
    
    return []
}