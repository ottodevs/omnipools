import FungibleToken from "FungibleToken"

// Mock USDC contract for development/testing
access(all) contract MockUSDC {
    
    // Total supply of tokens
    access(all) var totalSupply: UFix64
    
    // Storage paths
    access(all) let VaultStoragePath: StoragePath
    access(all) let VaultPublicPath: PublicPath
    access(all) let MinterStoragePath: StoragePath
    
    // Event that is emitted when the contract is created
    access(all) event ContractInitialized()
    
    // Event that is emitted when tokens are withdrawn from a Vault
    access(all) event TokensWithdrawn(amount: UFix64, from: Address?)
    
    // Event that is emitted when tokens are deposited to a Vault
    access(all) event TokensDeposited(amount: UFix64, to: Address?)
    
    // Event that is emitted when new tokens are minted
    access(all) event TokensMinted(amount: UFix64)
    
    // Event that is emitted when tokens are destroyed
    access(all) event TokensBurned(amount: UFix64)
    
    // Vault Resource
    access(all) resource Vault: FungibleToken.Provider, FungibleToken.Receiver, FungibleToken.Vault {
        // keeps track of the total balance of the account's tokens
        access(all) var balance: UFix64
        
        // initialize the vault
        init(balance: UFix64) {
            self.balance = balance
        }
        
        // withdraws tokens from the vault
        access(all) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            self.balance = self.balance - amount
            emit TokensWithdrawn(amount: amount, from: self.owner?.address)
            return <-create Vault(balance: amount)
        }
        
        // deposits tokens into the vault
        access(all) fun deposit(from: @{FungibleToken.Vault}) {
            let vault <- from as! @MockUSDC.Vault
            self.balance = self.balance + vault.balance
            emit TokensDeposited(amount: vault.balance, to: self.owner?.address)
            destroy vault
        }
    }
    
    // Resource that an account can own to mint tokens
    access(all) resource Minter {
        
        // mints new tokens
        access(all) fun mintTokens(amount: UFix64): @MockUSDC.Vault {
            MockUSDC.totalSupply = MockUSDC.totalSupply + amount
            emit TokensMinted(amount: amount)
            return <-create Vault(balance: amount)
        }
    }
    
    // creates a new empty vault
    access(all) fun createEmptyVault(): @MockUSDC.Vault {
        return <-create Vault(balance: 0.0)
    }
    
    // gets the total supply
    access(all) fun getTotalSupply(): UFix64 {
        return self.totalSupply
    }
    
    init() {
        self.totalSupply = 0.0
        
        self.VaultStoragePath = /storage/USDCVault
        self.VaultPublicPath = /public/USDCReceiver
        self.MinterStoragePath = /storage/USDCMinter
        
        emit ContractInitialized()
    }
}