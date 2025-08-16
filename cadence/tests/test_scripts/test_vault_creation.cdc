import Vaults from "Vaults"

access(all) fun main(): String {
    let participant = Vaults.Participant(
        id: 1,
        name: "Test User",
        walletAddr: 0x0000000000000001,
        email: "test@example.com"
    )
    
    let vault = Vaults.VaultData(
        name: "Test Vault",
        description: "A test vault",
        kind: 0,
        acceptedCurrencies: [],
        participants: [participant],
        winners: [],
        tranches: [],
        kycThreshold: 0.0,
        rails: [],
        receipts: [],
        fundingNotes: []
    )
    
    return "Vault created: ".concat(vault.name)
}