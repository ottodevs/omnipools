import Registry from "Registry"

access(all) fun main(): String {
    let org <- Registry.createOrg(name: "Test Org", logoCID: "ipfs://test")
    let result = "Org created: ".concat(org.name)
    destroy org
    return result
}