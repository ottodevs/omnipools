import Vaults from "Vaults"
import Registry from "Registry"

access(all) fun main(): String {
    // Test that contracts are accessible
    let vaultsPath = Vaults.VaultCollectionStoragePath
    let registryPath = Registry.OrgCollectionStoragePath
    
    return "Contracts are accessible. Vaults storage path: ".concat(vaultsPath.toString()).concat(", Registry storage path: ").concat(registryPath.toString())
} 