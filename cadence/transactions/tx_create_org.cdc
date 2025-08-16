import Registry from "Registry"

transaction(name: String, logoCID: String?) {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Setup org for the signer account
        Registry.setupOrgAccount(account: signer, name: name, logoCID: logoCID)
    }
    
    execute {
        log("Org created successfully")
    }
}