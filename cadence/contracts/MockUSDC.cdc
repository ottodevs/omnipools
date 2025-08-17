import "FungibleToken"
import "ViewResolver"
import "MetadataViews"

/// Mock USDC contract for development/testing
/// Implements Cadence 1.0 FungibleToken standard
access(all) contract MockUSDC: FungibleToken {
    
    /// Total supply of tokens
    access(all) var totalSupply: UFix64
    
    /// Storage paths
    access(all) let VaultStoragePath: StoragePath
    access(all) let VaultPublicPath: PublicPath
    access(all) let MinterStoragePath: StoragePath
    
    /// Event that is emitted when the contract is created
    access(all) event ContractInitialized()
    
    /// Event that is emitted when new tokens are minted
    access(all) event TokensMinted(amount: UFix64)
    
    /// Vault Resource - implements all required interfaces
    access(all) resource Vault: FungibleToken.Vault {
        /// The total balance of this vault
        access(all) var balance: UFix64
        
        /// Initialize the vault
        init(balance: UFix64) {
            self.balance = balance
        }
        
        /// Function that returns all the Metadata Views implemented by this Vault
        access(all) view fun getViews(): [Type] {
            return MockUSDC.getContractViews(resourceType: nil)
        }

        /// Function that resolves a metadata view for this Vault
        access(all) fun resolveView(_ view: Type): AnyStruct? {
            return MockUSDC.resolveContractView(resourceType: nil, viewType: view)
        }
        
        /// getSupportedVaultTypes optionally returns a list of vault types that this receiver accepts
        access(all) view fun getSupportedVaultTypes(): {Type: Bool} {
            let supportedTypes: {Type: Bool} = {}
            supportedTypes[self.getType()] = true
            return supportedTypes
        }

        /// Returns whether or not the given type is accepted by the Receiver
        access(all) view fun isSupportedVaultType(type: Type): Bool {
            return self.getSupportedVaultTypes()[type] ?? false
        }

        /// Asks if the amount can be withdrawn from this vault
        access(all) view fun isAvailableToWithdraw(amount: UFix64): Bool {
            return amount <= self.balance
        }
        
        /// withdraw subtracts `amount` from the vault's balance
        /// and returns a new vault with the subtracted balance
        access(FungibleToken.Withdraw) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            self.balance = self.balance - amount
            return <-create Vault(balance: amount)
        }
        
        /// deposit takes a Vault and deposits it into this vault
        access(all) fun deposit(from: @{FungibleToken.Vault}) {
            let vault <- from as! @MockUSDC.Vault
            self.balance = self.balance + vault.balance
            destroy vault
        }
        
        /// createEmptyVault allows any user to create a new Vault that has a zero balance
        access(all) fun createEmptyVault(): @{FungibleToken.Vault} {
            return <-create Vault(balance: 0.0)
        }
        
        /// Called when a fungible token is burned via the `Burner.burn()` method
        access(contract) fun burnCallback() {
            if self.balance > 0.0 {
                MockUSDC.totalSupply = MockUSDC.totalSupply - self.balance
            }
            self.balance = 0.0
        }
    }
    
    /// Resource that an account can own to mint tokens
    access(all) resource Minter {
        /// mints new tokens
        access(all) fun mintTokens(amount: UFix64): @MockUSDC.Vault {
            MockUSDC.totalSupply = MockUSDC.totalSupply + amount
            emit TokensMinted(amount: amount)
            return <-create Vault(balance: amount)
        }
    }
    
    /// createEmptyVault allows any user to create a new Vault that has a zero balance
    access(all) fun createEmptyVault(vaultType: Type): @{FungibleToken.Vault} {
        return <-create Vault(balance: 0.0)
    }
    
    /// createMinter creates a new minter resource
    access(all) fun createMinter(): @Minter {
        return <-create Minter()
    }
    
    /// getTotalSupply gets the total supply
    access(all) view fun getTotalSupply(): UFix64 {
        return self.totalSupply
    }
    
    /// Function that returns all the Metadata Views implemented by this contract
    access(all) view fun getContractViews(resourceType: Type?): [Type] {
        return [Type<MetadataViews.Traits>()]
    }

    /// Function that resolves a metadata view for this contract
    access(all) fun resolveContractView(resourceType: Type?, viewType: Type): AnyStruct? {
        switch viewType {
            case Type<MetadataViews.Traits>():
                return MetadataViews.Traits([])
        }
        return nil
    }
    
    init() {
        self.totalSupply = 0.0
        
        self.VaultStoragePath = /storage/USDCVault
        self.VaultPublicPath = /public/USDCReceiver
        self.MinterStoragePath = /storage/USDCMinter
        
        // Save a minter resource to the deployer account
        self.account.storage.save(<-create Minter(), to: self.MinterStoragePath)
        
        emit ContractInitialized()
    }
}