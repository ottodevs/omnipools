/**
 * Scripts Cadence optimizados con address replacement
 * FCL config reemplaza automáticamente 0xVaults con la dirección correcta
 */

export const CADENCE_SCRIPTS = {
  getVault: `
    import Vaults from 0xVaults

    access(all) fun main(orgAddr: Address, vaultId: UInt64): {String: AnyStruct}? {
        let orgAccount = getAccount(orgAddr)
        
        if let collectionRef = orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
            Vaults.VaultCollectionPublicPath
        ) {
            if let vaultRef = collectionRef.borrowVaultPublic(id: vaultId) {
                return vaultRef.getSummary()
            }
        }
        
        return nil
    }
  `,
  
  getVaultWinners: `
    import Vaults from 0xVaults

    access(all) fun main(orgAddr: Address, vaultId: UInt64): [Vaults.FlowUSDCWinner] {
        let orgAccount = getAccount(orgAddr)
        
        if let collectionRef = orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
            Vaults.VaultCollectionPublicPath
        ) {
            if let vaultRef = collectionRef.borrowVaultPublic(id: vaultId) {
                return vaultRef.getFlowUSDCWinners()
            }
        }
        
        return []
    }
  `,
  
  getVaultParticipants: `
    import Vaults from 0xVaults

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
  `,
  
  getVaultReceipts: `
    import Vaults from 0xVaults

    access(all) fun main(orgAddr: Address, vaultId: UInt64): [{String: String}] {
        let orgAccount = getAccount(orgAddr)
        
        if let collectionRef = orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
            Vaults.VaultCollectionPublicPath
        ) {
            if let vaultRef = collectionRef.borrowVaultPublic(id: vaultId) {
                return vaultRef.getReceipts()
            }
        }
        
        return []
    }
  `,

  // Nuevos scripts útiles
  getVaultsByOrg: `
    import Vaults from 0xVaults

    access(all) fun main(orgAddr: Address): [UInt64] {
        let orgAccount = getAccount(orgAddr)
        
        if let collectionRef = orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
            Vaults.VaultCollectionPublicPath
        ) {
            return collectionRef.getVaultIds()
        }
        
        return []
    }
  `,

  getOrgInfo: `
    import Registry from 0xRegistry

    access(all) fun main(orgAddr: Address): {String: AnyStruct}? {
        let orgAccount = getAccount(orgAddr)
        
        if let orgCollectionRef = orgAccount.capabilities.borrow<&Registry.OrgCollection>(
            Registry.OrgCollectionPublicPath
        ) {
            if let orgRef = orgCollectionRef.borrowOrg(address: orgAddr) {
                return {
                    "address": orgRef.getAddress(),
                    "name": orgRef.getName()
                }
            }
        }
        
        return nil
    }
  `
}