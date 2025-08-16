import FungibleToken from "FungibleToken"

// Get the USDC balance of a specific address
access(all) fun main(addr: Address): UFix64 {
    let account = getAccount(addr)
    let vault = account.capabilities.borrow<&{FungibleToken.Vault}>(/public/USDCVault)
    
    if vault == nil {
        return 0.0
    }
    
    return vault!.balance
} 