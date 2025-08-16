import Registry from "Registry"

transaction(orgAddr: Address, to: Address) {
    let adminBadge: &Registry.AdminBadge?
    let targetAccount: auth(Storage, Capabilities) &Account
    
    prepare(signer: auth(Storage, Capabilities) &Account, targetAccount: auth(Storage, Capabilities) &Account) {
        // Try to borrow admin badge (for admin-issued badges)
        self.adminBadge = signer.storage.borrow<&Registry.AdminBadge>(from: Registry.AdminBadgeStoragePath)
        self.targetAccount = targetAccount
    }
    
    execute {
        // For hackathon - simplified badge issuance
        // Setup creator badge for target account
        Registry.setupCreatorBadge(account: self.targetAccount, orgAddr: orgAddr)
        
        log("Creator badge issued successfully")
    }
}