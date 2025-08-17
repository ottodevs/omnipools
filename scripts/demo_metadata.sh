#!/bin/bash

# Demo script showcasing embedded metadata system (no IPFS needed)
echo "🚀 OmniPools Embedded Metadata Demo"
echo "=================================="

# Set variables
ORG="0xf8d6e0586b0a20c7"
VAULT_ID="1"

echo ""
echo "📋 Step 1: Reading Current Vault Metadata"
echo "----------------------------------------"
flow scripts execute ./cadence/scripts/sc_get_vault_metadata.cdc $ORG $VAULT_ID

echo ""
echo "📝 Step 2: Updating Vault Metadata (No IPFS Required)"
echo "----------------------------------------------------"
echo "Updating vault with embedded metadata..."

flow transactions send ./cadence/transactions/tx_update_vault_metadata.cdc --args-json '[{"type": "Address", "value": "0xf8d6e0586b0a20c7"}, {"type": "UInt64", "value": "1"}, {"type": "Optional", "value": {"type": "String", "value": "Demo Pool Winners"}}, {"type": "Optional", "value": {"type": "String", "value": "Complete bounty payout with embedded metadata - no IPFS needed!"}}, {"type": "Optional", "value": {"type": "String", "value": "https://omnipools.app/assets/logo-2025.png"}}, {"type": "Optional", "value": {"type": "String", "value": "https://omnipools.app/assets/banner-2025.png"}}, {"type": "Optional", "value": {"type": "String", "value": "https://omnipools.app/vaults/ethglobal-ny-2025"}}, {"type": "Optional", "value": {"type": "String", "value": "Flow Actions + Embedded Metadata"}}]'

echo ""
echo "⏳ Waiting for transaction to be sealed..."
sleep 3

echo ""
echo "📋 Step 3: Reading Updated Vault Metadata"
echo "----------------------------------------"
flow scripts execute ./cadence/scripts/sc_get_vault_metadata.cdc $ORG $VAULT_ID

echo ""
echo "🎯 Step 4: Metadata Views Analysis"
echo "--------------------------------"
echo "The vault now supports multiple metadata views:"
echo "✅ Display: Name, description, thumbnail"
echo "✅ ExternalURL: Direct link to vault"
echo "✅ Traits: Rich metadata with types and display info"
echo "✅ All data embedded on-chain - no IPFS dependencies!"

echo ""
echo "🚀 Benefits of Embedded Metadata:"
echo "================================"
echo "✅ No IPFS dependencies or pinning required"
echo "✅ Instant metadata updates"
echo "✅ Rich, typed metadata with display information"
echo "✅ Standard Flow MetadataViews compatibility"
echo "✅ Atomic updates with transaction rollback"
echo "✅ Direct on-chain verification"

echo ""
echo "🎉 Demo Complete! Embedded metadata system working perfectly!" 