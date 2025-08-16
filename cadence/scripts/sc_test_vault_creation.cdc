import Vaults from "Vaults"
import Registry from "Registry"

access(all) fun main(): String {
    // Test vault creation
    let vaultInit = Vaults.VaultInit(
        name: "Test Vault",
        kind: Vaults.VaultKind.Bounty,
        description: "A test vault for validation",
        bannerCID: "test-banner",
        logoCID: "test-logo",
        externalURL: "https://test.com",
        rails: Vaults.Rails(
            acceptedIn: ["FLOW"],
            payoutOut: ["FLOW"]
        ),
        kyc: Vaults.KYC(thresholdUsd: 1000.0),
        strategyHint: "test strategy"
    )
    
    // Test participant creation
    let participant = Vaults.Participant(
        id: 1,
        addr: 0x1234567890123456,
        meta: {"name": "Test Participant", "email": "test@example.com"}
    )
    
    // Test winner share creation
    let winnerShare = Vaults.WinnerShare(
        participantId: 1,
        amount: 1000.0,
        chainHint: "FLOW",
        tokenHint: "FLOW"
    )
    
    // Test tranche creation
    let tranche = Vaults.Tranche(
        unlockAt: 1234567890.0,
        amount: 500.0,
        purpose: "Initial payout"
    )
    
    return "All Vaults structs created successfully. Vault name: ".concat(vaultInit.name).concat(", Participant ID: ").concat(participant.id.toString()).concat(", Winner amount: ").concat(winnerShare.amount.toString())
} 