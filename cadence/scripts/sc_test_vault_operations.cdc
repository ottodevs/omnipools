import Vaults from "Vaults"
import Registry from "Registry"

access(all) fun main(): String {
    var result = ""
    
    // Test 1: Check contract constants
    result = result.concat("✓ Contract constants accessible\n")
    result = result.concat("  - Vaults storage path: ").concat(Vaults.VaultCollectionStoragePath.toString()).concat("\n")
    result = result.concat("  - Registry storage path: ").concat(Registry.OrgCollectionStoragePath.toString()).concat("\n")
    
    // Test 2: Check vault kinds
    result = result.concat("✓ Vault kinds available:\n")
    result = result.concat("  - Bounty: ").concat(Vaults.VaultKind.Bounty.rawValue.toString()).concat("\n")
    result = result.concat("  - StakingHouse: ").concat(Vaults.VaultKind.StakingHouse.rawValue.toString()).concat("\n")
    result = result.concat("  - GrantRound: ").concat(Vaults.VaultKind.GrantRound.rawValue.toString()).concat("\n")
    result = result.concat("  - Tournament: ").concat(Vaults.VaultKind.Tournament.rawValue.toString()).concat("\n")
    result = result.concat("  - GroupFund: ").concat(Vaults.VaultKind.GroupFund.rawValue.toString()).concat("\n")
    
    // Test 3: Create test data structures
    let testRails = Vaults.Rails(
        acceptedIn: ["FLOW", "USDC"],
        payoutOut: ["FLOW", "USDC"]
    )
    
    let testKYC = Vaults.KYC(thresholdUsd: 5000.0)
    
    let testVaultInit = Vaults.VaultInit(
        name: "Comprehensive Test Vault",
        kind: Vaults.VaultKind.GrantRound,
        description: "A comprehensive test vault for validation",
        bannerCID: "banner-cid-123",
        logoCID: "logo-cid-456",
        externalURL: "https://test-vault.com",
        rails: testRails,
        kyc: testKYC,
        strategyHint: "Automated testing strategy"
    )
    
    result = result.concat("✓ Test data structures created successfully\n")
    result = result.concat("  - Vault name: ").concat(testVaultInit.name).concat("\n")
    result = result.concat("  - Vault kind: ").concat(testVaultInit.kind.rawValue.toString()).concat("\n")
    result = result.concat("  - Accepted currencies: ").concat(testVaultInit.rails.acceptedIn.length.toString()).concat("\n")
    result = result.concat("  - KYC threshold: ").concat(testVaultInit.kyc?.thresholdUsd?.toString() ?? "None").concat("\n")
    
    // Test 4: Create test participants and winners
    let testParticipant1 = Vaults.Participant(
        id: 1,
        addr: 0x1111111111111111,
        meta: {"name": "Alice", "email": "alice@test.com", "github": "alice-dev"}
    )
    
    let testParticipant2 = Vaults.Participant(
        id: 2,
        addr: 0x2222222222222222,
        meta: {"name": "Bob", "email": "bob@test.com", "github": "bob-dev"}
    )
    
    let testWinner1 = Vaults.WinnerShare(
        participantId: 1,
        amount: 750.0,
        chainHint: "FLOW",
        tokenHint: "FLOW"
    )
    
    let testWinner2 = Vaults.WinnerShare(
        participantId: 2,
        amount: 250.0,
        chainHint: "FLOW",
        tokenHint: "FLOW"
    )
    
    result = result.concat("✓ Test participants and winners created\n")
    result = result.concat("  - Participant 1: ").concat(testParticipant1.meta["name"] ?? "Unknown").concat("\n")
    result = result.concat("  - Participant 2: ").concat(testParticipant2.meta["name"] ?? "Unknown").concat("\n")
    result = result.concat("  - Total winner amount: ").concat((testWinner1.amount + testWinner2.amount).toString()).concat("\n")
    
    // Test 5: Create test tranches
    let testTranche1 = Vaults.Tranche(
        unlockAt: 1234567890.0,
        amount: 600.0,
        purpose: "Initial milestone payout"
    )
    
    let testTranche2 = Vaults.Tranche(
        unlockAt: 1234567890.0 + 86400.0, // 1 day later
        amount: 400.0,
        purpose: "Final milestone payout"
    )
    
    result = result.concat("✓ Test tranches created\n")
    result = result.concat("  - Tranche 1: ").concat(testTranche1.amount.toString()).concat(" for ").concat(testTranche1.purpose).concat("\n")
    result = result.concat("  - Tranche 2: ").concat(testTranche2.amount.toString()).concat(" for ").concat(testTranche2.purpose).concat("\n")
    
    // Test 6: Validate data integrity
    var totalValidation = ""
    
    // Validate vault init
    if testVaultInit.name == "Comprehensive Test Vault" {
        totalValidation = totalValidation.concat("✓ Vault name validation passed\n")
    } else {
        totalValidation = totalValidation.concat("✗ Vault name validation failed\n")
    }
    
    if testVaultInit.kind == Vaults.VaultKind.GrantRound {
        totalValidation = totalValidation.concat("✓ Vault kind validation passed\n")
    } else {
        totalValidation = totalValidation.concat("✗ Vault kind validation failed\n")
    }
    
    if testVaultInit.rails.acceptedIn.length == 2 {
        totalValidation = totalValidation.concat("✓ Rails validation passed\n")
    } else {
        totalValidation = totalValidation.concat("✗ Rails validation failed\n")
    }
    
    // Validate participants
    if testParticipant1.id == 1 && testParticipant2.id == 2 {
        totalValidation = totalValidation.concat("✓ Participant ID validation passed\n")
    } else {
        totalValidation = totalValidation.concat("✗ Participant ID validation failed\n")
    }
    
    // Validate winners
    if testWinner1.amount + testWinner2.amount == 1000.0 {
        totalValidation = totalValidation.concat("✓ Winner amounts validation passed\n")
    } else {
        totalValidation = totalValidation.concat("✗ Winner amounts validation failed\n")
    }
    
    // Validate tranches
    if testTranche1.amount + testTranche2.amount == 1000.0 {
        totalValidation = totalValidation.concat("✓ Tranche amounts validation passed\n")
    } else {
        totalValidation = totalValidation.concat("✗ Tranche amounts validation failed\n")
    }
    
    result = result.concat("✓ Data validation completed:\n").concat(totalValidation)
    
    return result
} 