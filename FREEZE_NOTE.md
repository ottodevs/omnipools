# 🧊 Repository Freeze Note - ETHGlobal NY Demo

**Status**: FROZEN FOR DEMO  
**Date**: Block 1 (T+0 → T+25) Preflight Phase  
**Demo Environment**: Flow Emulator (local)

## 🔒 IMMUTABLE SURFACES - DO NOT CHANGE

### Contract Names & Addresses
- **Registry** (`0xf8d6e0586b0a20c7`)
- **Vaults** (`0xf8d6e0586b0a20c7`)  
- **MockUSDC** (`0xf8d6e0586b0a20c7`)
- **DeFiActions** (`0xf8d6e0586b0a20c7`)
- **FungibleToken** (`0xf8d6e0586b0a20c7`)
- **FungibleTokenConnectors** (`0xf8d6e0586b0a20c7`)

### Critical Event Names
**Registry Contract:**
- `OrgCreated(org: Address, name: String)`
- `CreatorIssued(org: Address, to: Address)`

**Vaults Contract:**
- `VaultCreated(vaultId: UInt64, org: Address, name: String, kind: UInt8)`
- `MetadataUpdated(vaultId: UInt64)`
- `ParticipantAdded(vaultId: UInt64, participantId: UInt64, addr: Address)`
- `FundingRecorded(vaultId: UInt64, note: {String:String})`
- `WinnersSet(vaultId: UInt64, count: Int)`
- `PayoutPlanned(vaultId: UInt64)`
- `PayoutExecuted(vaultId: UInt64, operationId: UInt64, totalPaid: UFix64)`
- `ReceiptAdded(vaultId: UInt64, uri: String, amount: String, vendor: String)`
- `OperatorAdded(vaultId: UInt64, operator: Address)`

### UI Routes (Critical Paths)
- **Home**: `/` - Landing page with vault link
- **Vault View**: `/vault/[id]` - Main demo screen (specifically `/vault/1`)
- **Health Check**: `/api/health` - Status endpoint

### Data Snapshot Locations
- **Demo Data**: `public/data/vault-1.json` - Demo vault state
- **Summary After**: `public/data/summary_after.json` - Post-payout state
- **Miss Data**: `public/data/vault-1-misses.json` - Alternative view

### Demo Script Constants
- **Org Address**: `0xf8d6e0586b0a20c7`
- **Vault ID**: `1`
- **Winner A**: `0xf8d6e0586b0a20c7`
- **Winner B**: `0xf8d6e0586b0a20c7`
- **Demo Vault Name**: "ETHGlobal NY Bounties"
- **Total Payout**: 5000.00 USDC (3000 + 2000)

### File Structure (Demo-Critical)
```
src/app/
├── page.tsx                    # Home page
├── vault/[id]/page.tsx         # Vault viewer
├── api/health/route.ts         # Health check
cadence/
├── contracts/Registry.cdc      # Organization management
├── contracts/Vaults.cdc        # Vault operations
├── contracts/MockUSDC.cdc      # Demo token
├── scripts/sc_get_summary.cdc  # Summary fetcher
├── transactions/tx_payout_split.cdc # Payout executor
scripts/demo.sh                 # Demo script
public/data/*.json              # Demo snapshots
```

### Judge Flow Steps (Immutable Sequence)
1. **Landing** - Navigate to home page `/`
2. **Enter Vault** - Click "Open Vault #1" → `/vault/1`
3. **Show Status** - Display "Paid" status, totalPaid: 5000.00 USDC
4. **Show Participants** - 2 participants registered
5. **Show Winners** - 2 winners with amounts (3000.00, 2000.00)
6. **Execute Payout** - Demonstrate Flow Actions execution
7. **Show Proof** - JSON summary with transaction data

## ⚠️ ROLLBACK PATHS

### If Emulator Crashes
1. Run: `make reset`
2. Run: `./scripts/demo.sh`
3. Refresh UI at `/vault/1`

### If Totals Show 0
1. Verify demo data exists: `public/data/vault-1.json`
2. Toggle to "Demo Data" mode in UI
3. Fallback: Show static snapshot from `summary_after.json`

### If UI Routing Fails
1. Check Next.js dev server: `bun run dev`
2. Verify routes exist: `/` and `/vault/1`
3. Fallback: Direct navigation via URL bar

### If Contract Deploy Fails
1. Clear state: `rm -rf flowdb`
2. Restart emulator: `flow emulator start --persist`
3. Deploy fresh: `flow deploy`

## 🚫 FORBIDDEN CHANGES
- ❌ Renaming contract files or contracts
- ❌ Changing event signatures or names  
- ❌ Modifying UI route paths
- ❌ Altering demo script constants
- ❌ Moving snapshot files
- ❌ Breaking imports in cadence files
- ❌ Changing package.json scripts used in demo

---
**Last Verified**: Demo path passing with 5000.00 USDC total payout  
**Contacts**: LE (technical), DO (risk), RS (scribe)