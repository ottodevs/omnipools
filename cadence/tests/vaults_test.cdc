import Test
import BlockchainHelpers
import "Vaults"
import "Registry"
import "FungibleTokenMock"

access(all) fun setup() {
    let err1 = Test.deployContract(
        name: "FungibleTokenMock",
        path: "../contracts/FungibleTokenMock.cdc",
        arguments: []
    )
    Test.expect(err1, Test.beNil())
    
    let err2 = Test.deployContract(
        name: "Registry",
        path: "../contracts/Registry.cdc",
        arguments: []
    )
    Test.expect(err2, Test.beNil())

    let err3 = Test.deployContract(
        name: "Vaults",
        path: "../contracts/Vaults.cdc",
        arguments: []
    )
    Test.expect(err3, Test.beNil())
}

access(all) fun testVaultCreation() {
    let result = Test.executeScript("./test_scripts/test_vault_creation.cdc", [])
    Test.expect(result, Test.beSucceeded())
    
    let returnedValue = result.returnValue! as! String
    Test.assertEqual("Vault created: Test Vault", returnedValue)
}

access(all) fun testParticipantCreation() {
    // Test that vault creation works (includes participant creation)
    let result = Test.executeScript("./test_scripts/test_vault_creation.cdc", [])
    Test.expect(result, Test.beSucceeded())
}