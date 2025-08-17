# Deployment Checklist

## Pre-Deployment ✅

- [x] **Build passes**: `bun run build` completes successfully
- [x] **PWA ready**: Manifest and service worker configured
- [x] **Environment variables**: Testnet configuration in place
- [x] **Documentation**: Judge flow and README updated
- [x] **Mobile optimized**: Responsive design tested
- [x] **Animations working**: Framer Motion transitions smooth

## Vercel Deployment

### Required Environment Variables
```bash
# Flow Network Configuration
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE_TESTNET=https://rest-testnet.onflow.org

# Demo Organization (Testnet Deployer Account)
NEXT_PUBLIC_DEMO_ORG_ADDRESS=0x035662afa58bdc22

# AI Configuration (optional - has fallback)
OPENAI_API_KEY=sk-...

# WalletConnect (optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=02176f1b2ab20d063240e614c75a4884
```

### Deployed Contract Addresses (Testnet)
All contracts deployed to: **0x035662afa58bdc22**
- Registry: 0x035662afa58bdc22
- Vaults: 0x035662afa58bdc22  
- MockUSDC: 0x035662afa58bdc22
- DeFiActions: 0x035662afa58bdc22
- FungibleTokenConnectors: 0x035662afa58bdc22

Standard Flow Contracts:
- FungibleToken: 0x9a0766d93b6608b7
- MetadataViews: 0x631e88ae7f1d7c20
- ViewResolver: 0x631e88ae7f1d7c20

### Deployment Steps
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy from main branch
4. Verify PWA manifest at `/manifest.json`
5. Test wallet connection on testnet
6. Verify AI endpoint at `/api/ai/recipe`

## Post-Deployment Testing

### Critical Path
- [ ] **PWA install**: "Add to Home Screen" works on mobile
- [ ] **Onboarding**: 3 screens with animations
- [ ] **Wallet connect**: FCL integration with Flow testnet
- [ ] **Role selection**: Persistent across page reloads
- [ ] **AI recipe**: Generates valid JSON with fallback
- [ ] **Create pool**: Transaction succeeds on testnet
- [ ] **Set winners**: On-chain storage works
- [ ] **Execute payout**: Flow Actions completes

### Judge Demo Verification
- [ ] **60-second path**: Complete flow in under 1 minute
- [ ] **Mobile experience**: Touch-friendly on phone
- [ ] **Error handling**: Graceful failures with guidance
- [ ] **Performance**: Sub-second response times
- [ ] **Visual polish**: Smooth animations, no jank

## Judge Assets

### Required Deliverables
- [ ] **Live URL**: Stable and accessible
- [ ] **Demo video**: 3-minute walkthrough recorded
- [ ] **Screenshots**: 6-8 high-quality images
- [ ] **README**: Complete with tech stack and features
- [ ] **Judge flow**: Step-by-step evaluation guide

### Backup Plan
- [ ] **Local demo**: Emulator setup tested
- [ ] **Screen recording**: Offline video available
- [ ] **Screenshots**: Static assets as fallback
- [ ] **Addresses**: Contract deployment documented

## Final Verification

Before submission:
- [ ] Live demo URL works
- [ ] Mobile install prompt appears
- [ ] Wallet connection succeeds
- [ ] AI generation responds
- [ ] Transactions complete
- [ ] All documentation links work
- [ ] Video and screenshots ready

## Emergency Contacts

- **Technical issues**: Check GitHub issues
- **Demo problems**: Verify testnet status
- **Performance**: Check Vercel function logs
- **Wallet issues**: Test with different providers

---

**Target**: Complete deployment by Block 7 deadline  
**Status**: Ready for deployment ✅