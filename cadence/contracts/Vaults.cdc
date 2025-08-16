import Registry from "Registry"

access(all) contract Vaults {
    
    // Events
    access(all) event VaultCreated(vaultId: UInt64, org: Address, name: String, kind: UInt8)
    access(all) event MetadataUpdated(vaultId: UInt64)
    access(all) event ParticipantAdded(vaultId: UInt64, participantId: UInt64, addr: Address)
    access(all) event FundingRecorded(vaultId: UInt64, note: {String:String})
    access(all) event WinnersSet(vaultId: UInt64, count: Int)
    access(all) event PayoutPlanned(vaultId: UInt64)
    access(all) event PayoutExecuted(vaultId: UInt64, operationId: UInt64, totalPaid: UFix64)
    access(all) event ReceiptAdded(vaultId: UInt64, uri: String, amount: String, vendor: String)
    access(all) event OperatorAdded(vaultId: UInt64, operator: Address)
    
    // Storage paths
    access(all) let VaultCollectionStoragePath: StoragePath
    access(all) let VaultCollectionPublicPath: PublicPath
    
    // Global vault counter
    access(all) var nextVaultId: UInt64
    
    // Enums
    access(all) enum VaultKind: UInt8 {
        access(all) case Bounty
        access(all) case StakingHouse
        access(all) case GrantRound
        access(all) case Tournament
        access(all) case GroupFund
    }
    
    // Structs
    access(all) struct Participant {
        access(all) let id: UInt64
        access(all) let addr: Address
        access(all) let meta: {String: String}
        access(all) let addedAt: UFix64
        
        init(id: UInt64, addr: Address, meta: {String: String}) {
            self.id = id
            self.addr = addr
            self.meta = meta
            self.addedAt = getCurrentBlock().timestamp
        }
    }
    
    access(all) struct WinnerShare {
        access(all) let participantId: UInt64
        access(all) let amount: UFix64
        access(all) let chainHint: String
        access(all) let tokenHint: String
        
        init(participantId: UInt64, amount: UFix64, chainHint: String, tokenHint: String) {
            self.participantId = participantId
            self.amount = amount
            self.chainHint = chainHint
            self.tokenHint = tokenHint
        }
    }
    
    access(all) struct Tranche {
        access(all) let unlockAt: UFix64
        access(all) let amount: UFix64
        access(all) let purpose: String
        
        init(unlockAt: UFix64, amount: UFix64, purpose: String) {
            self.unlockAt = unlockAt
            self.amount = amount
            self.purpose = purpose
        }
    }
    
    access(all) struct Rails {
        access(all) let acceptedIn: [String]
        access(all) let payoutOut: [String]
        
        init(acceptedIn: [String], payoutOut: [String]) {
            self.acceptedIn = acceptedIn
            self.payoutOut = payoutOut
        }
    }
    
    access(all) struct KYC {
        access(all) let thresholdUsd: UFix64?
        
        init(thresholdUsd: UFix64?) {
            self.thresholdUsd = thresholdUsd
        }
    }
    
    access(all) struct VaultInit {
        access(all) let name: String
        access(all) let kind: VaultKind
        access(all) let description: String
        access(all) let bannerCID: String?
        access(all) let logoCID: String?
        access(all) let externalURL: String?
        access(all) let rails: Rails
        access(all) let kyc: KYC?
        access(all) let strategyHint: String?
        
        init(
            name: String,
            kind: VaultKind,
            description: String,
            bannerCID: String?,
            logoCID: String?,
            externalURL: String?,
            rails: Rails,
            kyc: KYC?,
            strategyHint: String?
        ) {
            self.name = name
            self.kind = kind
            self.description = description
            self.bannerCID = bannerCID
            self.logoCID = logoCID
            self.externalURL = externalURL
            self.rails = rails
            self.kyc = kyc
            self.strategyHint = strategyHint
        }
    }
    
    // Vault Resource
    access(all) resource Vault: IVaultPublic {
        // Identity
        access(all) let id: UInt64
        access(all) let org: Address
        access(all) let kind: VaultKind
        access(all) let createdAt: UFix64
        
        // Metadata (all on-chain)
        access(all) var name: String
        access(all) var description: String
        access(all) var bannerCID: String?
        access(all) var logoCID: String?
        access(all) var externalURL: String?
        access(all) let rails: Rails
        access(all) let kyc: KYC?
        access(all) var strategyHint: String?
        
        // State
        access(all) var status: String // Draft|Live|PayoutPlanned|Paid
        access(all) var participants: {UInt64: Participant}
        access(all) var winners: [WinnerShare]
        access(all) var fundingNotes: [{String: String}]
        access(all) var receipts: [{String: String}]
        access(all) var operators: {Address: Bool}
        access(all) var nextParticipantId: UInt64
        access(all) var nextOperationId: UInt64
        access(all) var tranches: [Tranche]
        
        init(id: UInt64, org: Address, vaultInit: VaultInit) {
            self.id = id
            self.org = org
            self.kind = vaultInit.kind
            self.createdAt = getCurrentBlock().timestamp
            
            // Metadata
            self.name = vaultInit.name
            self.description = vaultInit.description
            self.bannerCID = vaultInit.bannerCID
            self.logoCID = vaultInit.logoCID
            self.externalURL = vaultInit.externalURL
            self.rails = vaultInit.rails
            self.kyc = vaultInit.kyc
            self.strategyHint = vaultInit.strategyHint
            
            // State
            self.status = "Draft"
            self.participants = {}
            self.winners = []
            self.fundingNotes = []
            self.receipts = []
            self.operators = {}
            self.nextParticipantId = 1
            self.nextOperationId = 1
            self.tranches = []
        }
        
        // Owner-only functions
        access(all) fun addOperator(addr: Address) {
            // Check authorization
            if self.owner?.address != self.org {
                panic("Only org owner can add operators")
            }
            self.operators[addr] = true
            emit OperatorAdded(vaultId: self.id, operator: addr)
        }
        
        // Owner or operator functions
        access(all) fun addParticipant(addr: Address, meta: {String: String}) {
            // Check authorization
            if !self.isAuthorized() {
                panic("Not authorized")
            }
            let participant = Participant(
                id: self.nextParticipantId,
                addr: addr,
                meta: meta
            )
            self.participants[self.nextParticipantId] = participant
            emit ParticipantAdded(
                vaultId: self.id,
                participantId: self.nextParticipantId,
                addr: addr
            )
            self.nextParticipantId = self.nextParticipantId + 1
        }
        
        access(all) fun recordFunding(note: {String: String}) {
            // Check authorization
            if !self.isAuthorized() {
                panic("Not authorized")
            }
            self.fundingNotes.append(note)
            emit FundingRecorded(vaultId: self.id, note: note)
        }
        
        access(all) fun setWinners(winners: [WinnerShare]) {
            // Check authorization
            if !self.isAuthorized() {
                panic("Not authorized")
            }
            self.winners = winners
            emit WinnersSet(vaultId: self.id, count: winners.length)
        }
        
        access(all) fun planPayout() {
            // Check authorization
            if !self.isAuthorized() {
                panic("Not authorized")
            }
            if self.winners.length == 0 {
                panic("No winners set")
            }
            self.status = "PayoutPlanned"
            emit PayoutPlanned(vaultId: self.id)
        }
        
        access(all) fun markPaid() {
            // Check authorization
            if !self.isAuthorized() {
                panic("Not authorized")
            }
            if self.status != "PayoutPlanned" {
                panic("Payout not planned")
            }
            self.status = "Paid"
            let opId = self.nextOperationId
            self.nextOperationId = self.nextOperationId + 1
            
            let totalAmount = self.calculateTotalWinnerAmount()
            emit PayoutExecuted(vaultId: self.id, operationId: opId, totalPaid: totalAmount)
        }
        
        access(all) fun addReceipt(receipt: {String: String}) {
            // Check authorization
            if !self.isAuthorized() {
                panic("Not authorized")
            }
            self.receipts.append(receipt)
            
            let uri = receipt["uri"] ?? ""
            let amount = receipt["amount"] ?? "0"
            let vendor = receipt["vendor"] ?? ""
            
            emit ReceiptAdded(vaultId: self.id, uri: uri, amount: amount, vendor: vendor)
        }
        
        access(all) fun updateMetadata(
            name: String?,
            description: String?,
            bannerCID: String?,
            logoCID: String?,
            externalURL: String?,
            strategyHint: String?
        ) {
            // Check authorization
            if !self.isAuthorized() {
                panic("Not authorized")
            }
            if name != nil { self.name = name! }
            if description != nil { self.description = description! }
            if bannerCID != nil { self.bannerCID = bannerCID }
            if logoCID != nil { self.logoCID = logoCID }
            if externalURL != nil { self.externalURL = externalURL }
            if strategyHint != nil { self.strategyHint = strategyHint }
            
            emit MetadataUpdated(vaultId: self.id)
        }
        
        access(all) fun setStatus(status: String) {
            // Check authorization
            if !self.isAuthorized() {
                panic("Not authorized")
            }
            self.status = status
        }
        
        // Helper functions
        access(self) fun isAuthorized(): Bool {
            if let ownerAddr = self.owner?.address {
                return ownerAddr == self.org || self.operators[ownerAddr] == true
            }
            return false
        }
        
        access(self) fun calculateTotalWinnerAmount(): UFix64 {
            var total: UFix64 = 0.0
            for winner in self.winners {
                total = total + winner.amount
            }
            return total
        }
        
        // Public read functions
        access(all) fun getSummary(): {String: AnyStruct} {
            var totalFunding: UFix64 = 0.0
            for note in self.fundingNotes {
                if let amount = note["amount"] {
                    let parsedAmount = UFix64.fromString(amount) ?? 0.0
                    totalFunding = totalFunding + parsedAmount
                }
            }
            
            let totalWinners = self.calculateTotalWinnerAmount()
            
            return {
                "id": self.id,
                "org": self.org,
                "name": self.name,
                "description": self.description,
                "kind": self.kind.rawValue,
                "status": self.status,
                "participantCount": self.participants.length,
                "winnerCount": self.winners.length,
                "fundingNoteCount": self.fundingNotes.length,
                "receiptCount": self.receipts.length,
                "totalFunding": totalFunding,
                "totalWinners": totalWinners,
                "lastOperationId": self.nextOperationId - 1,
                "createdAt": self.createdAt,
                "bannerCID": self.bannerCID,
                "logoCID": self.logoCID,
                "externalURL": self.externalURL
            }
        }
        
        access(all) fun getParticipants(): [Participant] {
            return self.participants.values
        }
        
        access(all) fun getWinners(): [WinnerShare] {
            return self.winners
        }
        
        access(all) fun getStatus(): String {
            return self.status
        }
        
        access(all) fun getFundingNotes(): [{String: String}] {
            return self.fundingNotes
        }
        
        access(all) fun getReceipts(): [{String: String}] {
            return self.receipts
        }
        
        access(all) fun getOperators(): [Address] {
            return self.operators.keys
        }
        
        access(all) fun getNextOperationId(): UInt64 {
            return self.nextOperationId
        }
    }
    
    // Public interface for Vault
    access(all) resource interface IVaultPublic {
        access(all) fun getSummary(): {String: AnyStruct}
        access(all) fun getParticipants(): [Participant]
        access(all) fun getWinners(): [WinnerShare]
        access(all) fun getStatus(): String
        access(all) fun getFundingNotes(): [{String: String}]
        access(all) fun getReceipts(): [{String: String}]
        access(all) fun getOperators(): [Address]
        access(all) fun getNextOperationId(): UInt64
    }
    
    // Vault Collection (per Org)
    access(all) resource VaultCollection {
        access(all) var vaults: @{UInt64: Vault}
        access(all) let org: Address
        
        init(org: Address) {
            self.vaults <- {}
            self.org = org
        }
        
        access(all) fun createVault(vaultInit: VaultInit): UInt64 {
            // Check authorization
            if !self.isAuthorizedToCreate() {
                panic("Not authorized to create vault")
            }
            
            let vaultId = Vaults.nextVaultId
            Vaults.nextVaultId = Vaults.nextVaultId + 1
            
            let vault <- create Vault(id: vaultId, org: self.org, vaultInit: vaultInit)
            
            // Store vault
            let oldVault <- self.vaults[vaultId] <- vault
            destroy oldVault
            
            emit VaultCreated(
                vaultId: vaultId,
                org: self.org,
                name: vaultInit.name,
                kind: vaultInit.kind.rawValue
            )
            
            return vaultId
        }
        
        access(all) fun borrowVault(id: UInt64): &Vault? {
            return &self.vaults[id]
        }
        
        access(all) fun borrowVaultPublic(id: UInt64): &{IVaultPublic}? {
            return &self.vaults[id]
        }
        
        access(all) fun getVaultIds(): [UInt64] {
            return self.vaults.keys
        }
        
        access(all) fun getVaultCount(): Int {
            return self.vaults.length
        }
        
        access(self) fun isAuthorizedToCreate(): Bool {
            // Check if caller is org owner
            if let ownerAddr = self.owner?.address {
                if ownerAddr == self.org {
                    return true
                }
                
                // Check if caller has creator badge for this org
                let account = getAccount(ownerAddr)
                if let badgeRef = account.capabilities.borrow<&Registry.CreatorBadge>(
                    Registry.CreatorBadgePublicPath
                ) {
                    return badgeRef.getOrg() == self.org
                }
            }
            return false
        }
        

    }
    
    // Public interface for VaultCollection
    access(all) resource interface VaultCollectionPublic {
        access(all) fun borrowVaultPublic(id: UInt64): &{IVaultPublic}?
        access(all) fun getVaultIds(): [UInt64]
        access(all) fun getVaultCount(): Int
    }
    
    // Public functions
    access(all) fun createVaultCollection(org: Address): @VaultCollection {
        return <- create VaultCollection(org: org)
    }
    
    access(all) fun getNextOperationId(vaultId: UInt64, orgAddr: Address): UInt64 {
        let account = getAccount(orgAddr)
        if let collectionRef = account.capabilities.borrow<&{VaultCollectionPublic}>(
            self.VaultCollectionPublicPath
        ) {
            if let vaultRef = collectionRef.borrowVaultPublic(id: vaultId) {
                return vaultRef.getNextOperationId()
            }
        }
        return 0
    }
    
    // Helper function to setup vault collection for an org
    access(all) fun setupVaultCollection(account: auth(Storage, Capabilities) &Account) {
        // Check if already setup
        if account.storage.borrow<&VaultCollection>(from: self.VaultCollectionStoragePath) != nil {
            return
        }
        
        // Create and store vault collection
        let collection <- self.createVaultCollection(org: account.address)
        account.storage.save(<-collection, to: self.VaultCollectionStoragePath)
        
        // Link public capability
        account.capabilities.publish(
            account.capabilities.storage.issue<&VaultCollection>(self.VaultCollectionStoragePath),
            at: self.VaultCollectionPublicPath
        )
    }
    
    init() {
        // Set storage paths
        self.VaultCollectionStoragePath = /storage/OrgVaults
        self.VaultCollectionPublicPath = /public/OrgVaults
        
        // Initialize vault counter
        self.nextVaultId = 1
    }
}