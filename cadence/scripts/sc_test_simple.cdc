import Vaults from "Vaults"

access(all) fun main(): String {
    // Test basic vault creation
    let vaultInit = Vaults.VaultInit(
        name: "Simple Test Vault",
        kind: Vaults.VaultKind.Bounty,
        description: "A simple test vault",
        bannerCID: nil,
        logoCID: nil,
        externalURL: nil,
        rails: Vaults.Rails(
            acceptedIn: ["FLOW"],
            payoutOut: ["FLOW"]
        ),
        kyc: nil,
        strategyHint: nil
    )
    
    // Test participant creation
    let participant = Vaults.Participant(
        id: 1,
        addr: 0x1234567890123456,
        meta: {"name": "Test User"}
    )
    
    // Test winner share creation
    let winnerShare = Vaults.WinnerShare(
        participantId: 1,
        amount: 100.0,
        chainHint: "FLOW",
        tokenHint: "FLOW"
    )
    
    return "Simple test passed! Vault: ".concat(vaultInit.name).concat(", Participant: ").concat(participant.meta["name"] ?? "Unknown").concat(", Amount: ").concat(winnerShare.amount.toString())
} 