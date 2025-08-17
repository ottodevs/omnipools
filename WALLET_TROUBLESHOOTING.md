# Wallet Connection Troubleshooting

## Issue: Wallet Connection Fails on Testnet

**Error symptoms:**
- "User rejected the request"
- "ethAccounts Array(0)"
- Failed to load resource: net::ERR_FILE_NOT_FOUND for banner image

## Quick Fixes

### 1. Check Network Configuration

Make sure you're on the correct network:
1. Open browser dev tools (F12)
2. Check console for FCL configuration logs
3. Verify network is set to "testnet"

### 2. Try Different Wallet Providers

If one wallet fails, try others:
- **Blocto Wallet** (recommended for testnet)
- **Flow Wallet** 
- **Lilico Wallet**

### 3. Clear Browser Data

Sometimes cached data causes issues:
1. Clear browser cache and cookies
2. Refresh the page
3. Try wallet connection again

### 4. Check Testnet Status

Verify Flow testnet is operational:
- Visit [Flow Status](https://status.onflow.org/)
- Check if testnet access nodes are working

### 5. Manual Configuration (Emergency Fix)

If the app is still not working, you can force local configuration:

1. Open browser dev tools
2. Go to Console tab
3. Run this command:

```javascript
// Force local emulator configuration
fcl.config({
  'flow.network': 'local',
  'accessNode.api': 'http://localhost:8888',
  'discovery.wallet': 'http://localhost:8701/fcl/authn'
})
```

Then start the local emulator:
```bash
flow emulator start
flow dev-wallet
```

### 6. Environment Variables

Make sure environment variables are set correctly:

```bash
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE_TESTNET=https://rest-testnet.onflow.org
```

## For Judges/Demo

If wallet connection is still not working during the demo:

1. **Use Local Emulator**: Switch to local development mode
   ```bash
   bun run judge  # This starts emulator + dev wallet
   ```

2. **Show Screenshots**: Use the prepared screenshots in `public/press/`

3. **Video Walkthrough**: Play the recorded demo video

4. **Code Review**: Show the transaction code and explain the Flow Actions implementation

## Technical Details

The wallet connection uses:
- **FCL (Flow Client Library)** for wallet integration
- **Flow Discovery** service for wallet selection
- **WebAuthn/RPC** protocols for secure authentication

Common issues:
- Network mismatches (local vs testnet)
- CORS issues with wallet providers  
- Cached configuration conflicts
- Testnet access node downtime

## Contact

If issues persist during judging:
- Check GitHub issues for known problems
- Verify Flow testnet status
- Fall back to local emulator demo