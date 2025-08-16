import FungibleToken from "FungibleToken"
import MockUSDC from "MockUSDC"

// Transaction to mint USDC tokens to a specific account
transaction(recipient: Address, amount: UFix64) {
    
    let minter: &MockUSDC.Minter
    let receiverRef: &{FungibleToken.Receiver}
    
    prepare(signer: auth(Storage) &Account) {
        // Get reference to the minter resource
        self.minter = signer.storage.borrow<&MockUSDC.Minter>(from: MockUSDC.MinterStoragePath)
            ?? panic("Could not borrow minter reference")
        
        // Get the recipient's receiver capability
        let recipientAccount = getAccount(recipient)
        self.receiverRef = recipientAccount.capabilities.borrow<&{FungibleToken.Receiver}>(MockUSDC.VaultPublicPath)
            ?? panic("Could not borrow receiver reference")
    }
    
    execute {
        // Mint tokens and deposit them to the recipient
        let vault <- self.minter.mintTokens(amount: amount)
        self.receiverRef.deposit(from: <-vault)
        
        log("Minted and deposited USDC tokens")
    }
}