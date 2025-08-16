access(all) contract Registry {
    
    // Events
    access(all) event OrgCreated(org: Address, name: String)
    access(all) event CreatorIssued(org: Address, to: Address)
    
    // Storage paths
    access(all) let AdminBadgeStoragePath: StoragePath
    access(all) let OrgCollectionStoragePath: StoragePath
    access(all) let OrgCollectionPublicPath: PublicPath
    access(all) let CreatorBadgeStoragePath: StoragePath
    access(all) let CreatorBadgePublicPath: PublicPath
    
    // Admin Badge Resource - Platform admin capability
    access(all) resource AdminBadge {
        access(all) fun createOrg(name: String, logoCID: String?): @Org {
            return <- create Org(name: name, logoCID: logoCID)
        }
        
        access(all) fun issueCreatorBadge(orgAddr: Address, to: Address): @CreatorBadge {
            return <- create CreatorBadge(org: orgAddr)
        }
    }
    
    // Organization Resource - Owns vaults and can grant creator badges
    access(all) resource Org {
        access(all) let address: Address
        access(all) let name: String
        access(all) let logoCID: String?
        access(all) let createdAt: UFix64
        
        init(name: String, logoCID: String?) {
            // For hackathon testing - allow creation without owner context
            // In production, this would require proper ownership
            self.address = self.owner?.address ?? 0x0000000000000000
            self.name = name
            self.logoCID = logoCID
            self.createdAt = getCurrentBlock().timestamp
        }
        
        access(all) fun grantCreator(to: Address): @CreatorBadge {
            return <- create CreatorBadge(org: self.address)
        }
        
        access(all) fun getName(): String {
            return self.name
        }
        
        access(all) fun getAddress(): Address {
            return self.address
        }
    }
    
    // Creator Badge Resource - Capability to create vaults for a specific org
    access(all) resource CreatorBadge {
        access(all) let org: Address
        access(all) let issuedAt: UFix64
        
        init(org: Address) {
            self.org = org
            self.issuedAt = getCurrentBlock().timestamp
        }
        
        access(all) fun getOrg(): Address {
            return self.org
        }
    }
    
    // Public interface for CreatorBadge
    access(all) resource interface CreatorBadgePublic {
        access(all) fun getOrg(): Address
    }
    
    // Collection to store multiple orgs (for admin account)
    access(all) resource OrgCollection {
        access(all) var orgs: @{Address: Org}
        
        init() {
            self.orgs <- {}
        }
        
        access(all) fun createOrg(name: String, logoCID: String?): Address {
            let org <- create Org(name: name, logoCID: logoCID)
            let orgAddress = org.address
            
            // Store the org
            let oldOrg <- self.orgs[orgAddress] <- org
            destroy oldOrg
            
            emit OrgCreated(org: orgAddress, name: name)
            return orgAddress
        }
        
        access(all) fun borrowOrg(address: Address): &Org? {
            return &self.orgs[address]
        }
        
        access(all) fun getOrgAddresses(): [Address] {
            return self.orgs.keys
        }
        

    }
    
    // Public interface for OrgCollection
    access(all) resource interface OrgCollectionPublic {
        access(all) fun borrowOrg(address: Address): &Org?
        access(all) fun getOrgAddresses(): [Address]
    }
    
    // Public functions
    access(all) fun createOrg(name: String, logoCID: String?): @Org {
        // For hackathon - allow self-service org creation
        // In production, this would require AdminBadge capability
        return <- create Org(name: name, logoCID: logoCID)
    }
    
    access(all) fun issueCreatorBadge(orgAddr: Address, to: Address): @CreatorBadge {
        // For hackathon - simplified badge issuance
        // In production, this would require Admin or Org owner capability
        emit CreatorIssued(org: orgAddr, to: to)
        return <- create CreatorBadge(org: orgAddr)
    }
    
    // Helper function to setup an org account
    access(all) fun setupOrgAccount(account: auth(Storage, Capabilities) &Account, name: String, logoCID: String?) {
        // Check if already setup
        if account.storage.borrow<&OrgCollection>(from: self.OrgCollectionStoragePath) != nil {
            panic("Org already exists for this account")
        }
        
        // Create and store org collection
        let orgCollection <- create OrgCollection()
        account.storage.save(<-orgCollection, to: self.OrgCollectionStoragePath)
        
        // Link public capability
        account.capabilities.publish(
            account.capabilities.storage.issue<&OrgCollection>(self.OrgCollectionStoragePath),
            at: self.OrgCollectionPublicPath
        )
        
        emit OrgCreated(org: account.address, name: name)
    }
    
    // Helper function to setup creator badge
    access(all) fun setupCreatorBadge(account: auth(Storage, Capabilities) &Account, orgAddr: Address) {
        // Create and store creator badge
        let badge <- self.issueCreatorBadge(orgAddr: orgAddr, to: account.address)
        account.storage.save(<-badge, to: self.CreatorBadgeStoragePath)
        
        // Link public capability
        account.capabilities.publish(
            account.capabilities.storage.issue<&CreatorBadge>(self.CreatorBadgeStoragePath),
            at: self.CreatorBadgePublicPath
        )
    }
    
    init() {
        // Set storage paths
        self.AdminBadgeStoragePath = /storage/AdminBadge
        self.OrgCollectionStoragePath = /storage/OrgCollection
        self.OrgCollectionPublicPath = /public/OrgRegistry
        self.CreatorBadgeStoragePath = /storage/CreatorBadge
        self.CreatorBadgePublicPath = /public/CreatorBadge
        
        // Create and store admin badge in deploying account
        self.account.storage.save(<-create AdminBadge(), to: self.AdminBadgeStoragePath)
        
        // Create org collection for admin account
        self.account.storage.save(<-create OrgCollection(), to: self.OrgCollectionStoragePath)
        self.account.capabilities.publish(
            self.account.capabilities.storage.issue<&OrgCollection>(self.OrgCollectionStoragePath),
            at: self.OrgCollectionPublicPath
        )
    }
}