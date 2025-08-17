import * as fcl from '@onflow/fcl'
import { ImageMetadata } from '@/lib/utils/image-utils'

export interface VaultMetadata {
  name: string
  description: string
  externalURL?: string
  bannerURL?: string
  image?: ImageMetadata
}

export async function createVaultTransaction(
  orgAddr: string,
  metadata: VaultMetadata,
  vaultKind: number = 0 // 0 for Bounty
): Promise<string> {
  const code = `
import Registry from 0xRegistry
import Vaults from 0xVaults

transaction(
    orgAddr: Address,
    name: String,
    kind: UInt8,
    description: String,
    bannerCID: String?,
    logoCID: String?,
    externalURL: String?,
    acceptedIn: [String],
    payoutOut: [String],
    kycThresholdUsd: UFix64?,
    strategyHint: String?
) {
    let orgAccount: &Account
    let vaultCollection: &Vaults.VaultCollection
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Get org account
        self.orgAccount = getAccount(orgAddr)
        
        // Setup vault collection for org if not exists
        Vaults.setupVaultCollection(account: signer)
        
        // Borrow vault collection
        self.vaultCollection = signer.storage.borrow<&Vaults.VaultCollection>(
            from: Vaults.VaultCollectionStoragePath
        ) ?? panic("Could not borrow vault collection")
    }
    
    execute {
        // Create rails
        let rails = Vaults.Rails(acceptedIn: acceptedIn, payoutOut: payoutOut)
        
        // Create KYC if threshold provided
        let kyc = kycThresholdUsd != nil ? Vaults.KYC(thresholdUsd: kycThresholdUsd) : nil
        
        // Create vault kind enum
        let vaultKind = Vaults.VaultKind(rawValue: kind) ?? panic("Invalid vault kind")
        
        // Create vault init struct
        let vaultInit = Vaults.VaultInit(
            name: name,
            kind: vaultKind,
            description: description,
            bannerCID: bannerCID,
            logoCID: logoCID,
            externalURL: externalURL,
            rails: rails,
            kyc: kyc,
            strategyHint: strategyHint
        )
        
        // Create vault
        let vaultId = self.vaultCollection.createVault(vaultInit: vaultInit)
        
        log("Vault created with ID: ".concat(vaultId.toString()))
    }
}
  `

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(orgAddr, t.Address),
      arg(metadata.name, t.String),
      arg(vaultKind, t.UInt8),
      arg(metadata.description, t.String),
      arg(metadata.bannerURL || null, t.Optional(t.String)),
      arg(metadata.image?.imageSVG || metadata.image?.imageURL || null, t.Optional(t.String)),
      arg(metadata.externalURL || null, t.Optional(t.String)),
      arg(['USDC'], t.Array(t.String)),
      arg(['USDC'], t.Array(t.String)),
      arg(null, t.Optional(t.UFix64)),
      arg(null, t.Optional(t.String))
    ],
    proposer: fcl.authz,
    payer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 1000
  })

  return transactionId
}

export async function waitForTransaction(transactionId: string): Promise<any> {
  return fcl.tx(transactionId).onceSealed()
}

// Link USDC receiver capability for participant
export async function linkUSDCReceiverTransaction(): Promise<string> {
  const code = `
import MockUSDC from 0xMockUSDC
import FungibleToken from 0xFungibleToken

transaction {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Check if vault already exists
        if signer.storage.borrow<&MockUSDC.Vault>(from: MockUSDC.VaultStoragePath) == nil {
            // Create a new vault
            let vault <- MockUSDC.createEmptyVault(vaultType: Type<@MockUSDC.Vault>())
            signer.storage.save(<-vault, to: MockUSDC.VaultStoragePath)
        }

        // Check if capability already exists
        if !signer.capabilities.get<&{FungibleToken.Receiver}>(MockUSDC.VaultPublicPath).check() {
            // Create and publish the receiver capability
            let receiverCap = signer.capabilities.storage.issue<&{FungibleToken.Receiver}>(MockUSDC.VaultStoragePath)
            signer.capabilities.publish(receiverCap, at: MockUSDC.VaultPublicPath)
        }

        log("USDC receiver capability linked successfully")
    }
}
  `

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => [],
    proposer: fcl.authz,
    payer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 1000
  })

  return transactionId
}

// Set winners for a vault (Organizer only)
export async function setWinnersTransaction(
  vaultId: number,
  winners: Array<{ address: string; amount: number }>
): Promise<string> {
  const code = `
import Vaults from 0xVaults

transaction(vaultId: UInt64, winners: [{String: UFix64}]) {
    let vaultCollection: &Vaults.VaultCollection

    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.vaultCollection = signer.storage.borrow<&Vaults.VaultCollection>(
            from: Vaults.VaultCollectionStoragePath
        ) ?? panic("Could not borrow vault collection")
    }

    execute {
        let vaultRef = self.vaultCollection.borrowVault(id: vaultId)
            ?? panic("Vault not found")

        // Clear existing winners
        vaultRef.clearWinners()

        // Add new winners
        for winner in winners {
            for addressStr in winner.keys {
                let address = Address.fromString(addressStr) ?? panic("Invalid address")
                let amount = winner[addressStr]!
                vaultRef.addWinner(addr: address, amount: amount)
            }
        }

        log("Winners set successfully for vault ".concat(vaultId.toString()))
    }
}
  `

  // Convert winners to the format expected by Cadence
  const winnersArray = winners.map(winner => ({
    key: winner.address,
    value: winner.amount.toFixed(8)
  }))

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(vaultId, t.UInt64),
      arg(winnersArray, t.Array(t.Dictionary({ key: t.String, value: t.UFix64 })))
    ],
    proposer: fcl.authz,
    payer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 1000
  })

  return transactionId
}

// Execute Flow Actions payout
export async function executePayoutTransaction(
  vaultId: number,
  orgAddress: string
): Promise<string> {
  const code = `
import Vaults from 0xVaults
import DeFiActions from 0xDeFiActions
import FungibleTokenConnectors from 0xFungibleTokenConnectors
import MockUSDC from 0xMockUSDC
import FungibleToken from 0xFungibleToken

transaction(vaultId: UInt64, orgAddr: Address) {
    let vaultCollection: &Vaults.VaultCollection

    prepare(signer: auth(Storage, Capabilities) &Account) {
        let orgAccount = getAccount(orgAddr)
        self.vaultCollection = orgAccount.capabilities.borrow<&Vaults.VaultCollection>(
            Vaults.VaultCollectionPublicPath
        ) ?? panic("Could not borrow vault collection from org")
    }

    execute {
        let vaultRef = self.vaultCollection.borrowVault(id: vaultId)
            ?? panic("Vault not found")

        // Get the vault's treasury (simplified - would need proper treasury setup)
        let treasuryVault = getAccount(orgAddr).capabilities
            .borrow<&{FungibleToken.Provider}>(MockUSDC.VaultPublicPath)
            ?? panic("Could not borrow treasury vault")

        var totalPaid: UFix64 = 0.0
        var misses: {Address: UFix64} = {}

        // Process each winner with weak guarantees
        let winners = vaultRef.getWinners()
        for winner in winners {
            let receiverCap = getAccount(winner.addr).capabilities
                .get<&{FungibleToken.Receiver}>(MockUSDC.VaultPublicPath)
            
            if receiverCap.check() {
                // Receiver is ready - execute payment
                let receiver = receiverCap.borrow()!
                let payment <- treasuryVault.withdraw(amount: winner.amount)
                receiver.deposit(from: <-payment)
                totalPaid = totalPaid + winner.amount
            } else {
                // Receiver not ready - add to misses
                misses[winner.addr] = winner.amount
            }
        }

        // Update vault state
        let operationId = vaultRef.getNextOperationId()
        vaultRef.markPaidWithDetails(operationId: operationId, totalPaid: totalPaid, misses: misses)

        log("Payout executed - Operation ID: ".concat(operationId.toString())
            .concat(", Total Paid: ").concat(totalPaid.toString())
            .concat(", Misses: ").concat(misses.length.toString()))
    }
}
  `

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(vaultId, t.UInt64),
      arg(orgAddress, t.Address)
    ],
    proposer: fcl.authz,
    payer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 1000
  })

  return transactionId
}