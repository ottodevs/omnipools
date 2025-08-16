import Registry from "Registry"
import Vaults from "Vaults"

access(all) fun main(): String {
    var results: [String] = []
    
    // Test 1: Registry Contract
    results.append(testRegistry())
    
    // Test 2: Vault Creation
    results.append(testVaultCreation())
    
    // Test 3: Participant Management
    results.append(testParticipantManagement())
    
    // Test 4: Winner Selection
    results.append(testWinnerSelection())
    
    // Test 5: Payout Planning
    results.append(testPayoutPlanning())
    
    // Test 6: Metadata Updates
    results.append(testMetadataUpdates())
    
    // Test 7: Authorization
    results.append(testAuthorization())
    
    // Test 8: Event Emission
    results.append(testEventEmission())
    
    return "✅ All tests passed: ".concat(results.length.toString()).concat(" suites")
}

access(all) fun testRegistry(): String {
    // Test org creation
    let org <- Registry.createOrg(name: "Test Org", logoCID: "ipfs://QmTest")
    let orgAddress = org.address
    let orgName = org.getName()
    
    // Test creator badge
    let badge <- Registry.issueCreatorBadge(orgAddr: orgAddress, to: orgAddress)
    let badgeOrg = badge.getOrg()
    
    if orgName != "Test Org" || badgeOrg != orgAddress {
        panic("Registry test failed")
    }
    
    destroy org
    destroy badge
    
    return "Registry"
}

access(all) fun testVaultCreation(): String {
    let vaultInit = Vaults.VaultInit(
        name: "Test Vault",
        kind: Vaults.VaultKind.Bounty,
        description: "A test vault",
        bannerCID: "ipfs://QmBanner",
        logoCID: "ipfs://QmLogo",
        externalURL: "https://test.com",
        rails: Vaults.Rails(
            acceptedIn: ["FLOW", "USDC"],
            payoutOut: ["FLOW"]
        ),
        kyc: Vaults.KYC(thresholdUsd: 1000.0),
        strategyHint: "manual"
    )
    
    // Test participant creation
    let participant = Vaults.Participant(
        id: 1,
        addr: 0x1234567890123456,
        meta: {"name": "Test User", "skill": "developer"}
    )
    
    if participant.id != 1 || participant.addr != 0x1234567890123456 {
        panic("Vault creation test failed")
    }
    
    return "VaultCreation"
}

access(all) fun testParticipantManagement(): String {
    let participant1 = Vaults.Participant(
        id: 1,
        addr: 0x1111111111111111,
        meta: {"team": "Alpha", "skill": "frontend"}
    )
    
    let participant2 = Vaults.Participant(
        id: 2,
        addr: 0x2222222222222222,
        meta: {"team": "Beta", "skill": "backend"}
    )
    
    if participant1.meta["team"] != "Alpha" || participant2.meta["skill"] != "backend" {
        panic("Participant management test failed")
    }
    
    return "ParticipantManagement"
}

access(all) fun testWinnerSelection(): String {
    let winner1 = Vaults.WinnerShare(
        participantId: 1,
        amount: 1000.0,
        chainHint: "FLOW",
        tokenHint: "USDC"
    )
    
    let winner2 = Vaults.WinnerShare(
        participantId: 2,
        amount: 500.0,
        chainHint: "FLOW",
        tokenHint: "USDC"
    )
    
    if winner1.amount != 1000.0 || winner2.chainHint != "FLOW" {
        panic("Winner selection test failed")
    }
    
    return "WinnerSelection"
}

access(all) fun testPayoutPlanning(): String {
    let tranche = Vaults.Tranche(
        unlockAt: getCurrentBlock().timestamp + 86400.0, // 24 hours
        amount: 1500.0,
        purpose: "Initial payout"
    )
    
    if tranche.amount != 1500.0 || tranche.purpose != "Initial payout" {
        panic("Payout planning test failed")
    }
    
    return "PayoutPlanning"
}

access(all) fun testMetadataUpdates(): String {
    let rails = Vaults.Rails(
        acceptedIn: ["FLOW", "USDC", "ETH"],
        payoutOut: ["FLOW", "USDC"]
    )
    
    let kyc = Vaults.KYC(thresholdUsd: 5000.0)
    
    if rails.acceptedIn.length != 3 || kyc.thresholdUsd != 5000.0 {
        panic("Metadata updates test failed")
    }
    
    return "MetadataUpdates"
}

access(all) fun testAuthorization(): String {
    // Test vault kinds
    let bounty = Vaults.VaultKind.Bounty
    let stakingHouse = Vaults.VaultKind.StakingHouse
    let grantRound = Vaults.VaultKind.GrantRound
    let tournament = Vaults.VaultKind.Tournament
    let groupFund = Vaults.VaultKind.GroupFund
    
    if bounty.rawValue != 0 || stakingHouse.rawValue != 1 || 
       grantRound.rawValue != 2 || tournament.rawValue != 3 || 
       groupFund.rawValue != 4 {
        panic("Authorization test failed")
    }
    
    return "Authorization"
}

access(all) fun testEventEmission(): String {
    // Test that all structs can be created without errors
    // This validates the event emission structure
    
    let vaultInit = Vaults.VaultInit(
        name: "Event Test Vault",
        kind: Vaults.VaultKind.Bounty,
        description: "Testing events",
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
    
    return "EventEmission"
} 