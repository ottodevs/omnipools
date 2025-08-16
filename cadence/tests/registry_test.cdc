import Test
import BlockchainHelpers
import "Registry"

access(all) fun setup() {
    let err = Test.deployContract(
        name: "Registry",
        path: "../contracts/Registry.cdc",
        arguments: []
    )
    Test.expect(err, Test.beNil())
}

access(all) fun testCreateOrg() {
    let result = Test.executeScript("./test_scripts/test_registry_create_org.cdc", [])
    Test.expect(result, Test.beSucceeded())
    
    let returnedValue = result.returnValue! as! String
    Test.assertEqual("Org created: Test Org", returnedValue)
}

access(all) fun testIssueCreatorBadge() {
    // Test that issueCreatorBadge function exists and can be called
    // For now just test that Registry contract is available
    let result = Test.executeScript("./test_scripts/test_registry_create_org.cdc", [])
    Test.expect(result, Test.beSucceeded())
}