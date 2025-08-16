import Registry from "Registry"

transaction(name: String) {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Setup org for the signer account (passing nil for logoCID)
        Registry.setupOrgAccount(account: signer, name: name, logoCID: nil)
    }
    
    execute {
        log("Org created successfully")
    }
}