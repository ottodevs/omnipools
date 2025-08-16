import MockUSDC from "MockUSDC"

// Transaction to set up the minter resource for MockUSDC
transaction() {
    
    prepare(signer: auth(Storage) &Account) {
        // Check if minter already exists
        if signer.storage.borrow<&MockUSDC.Minter>(from: MockUSDC.MinterStoragePath) != nil {
            return
        }
        
        // Create and store the minter resource
        let minter <- MockUSDC.createMinter()
        signer.storage.save(<-minter, to: MockUSDC.MinterStoragePath)
        
        log("Minter resource created and stored")
    }
    
    execute {
        log("Minter setup completed")
    }
} 