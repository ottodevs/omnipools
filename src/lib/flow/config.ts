import { config } from '@onflow/fcl'

export type NetworkType = 'local' | 'testnet' | 'mainnet'

// Network configurations following official FCL documentation
const NETWORK_CONFIGS = {
  local: {
    accessNode: process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE_LOCAL ?? 'http://localhost:8888',
    discovery: 'http://localhost:8701/fcl/authn',
    network: 'local',
  },
  testnet: {
    accessNode: process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE_TESTNET ?? 'https://rest-testnet.onflow.org',
    discovery: 'https://fcl-discovery.onflow.org/testnet/authn',
    network: 'testnet',
  },
  mainnet: {
    accessNode: process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE_MAINNET ?? 'https://rest-mainnet.onflow.org',
    discovery: 'https://fcl-discovery.onflow.org/authn',
    network: 'mainnet',
  },
} as const

// Contract addresses by network (simplified approach)
function getContractAddresses(network: NetworkType) {
  const addresses = {
    local: {
      Vaults: '0xf8d6e0586b0a20c7',
      Registry: '0xf8d6e0586b0a20c7',
      FungibleToken: '0xf8d6e0586b0a20c7',
      MockUSDC: '0xf8d6e0586b0a20c7',
      DeFiActions: '0xf8d6e0586b0a20c7',
      FungibleTokenConnectors: '0xf8d6e0586b0a20c7',
    },
    testnet: {
      // Production testnet addresses - contracts deployed to 0x035662afa58bdc22
      Vaults: '0x035662afa58bdc22', // Deployed to testnet
      Registry: '0x035662afa58bdc22', // Deployed to testnet
      FungibleToken: '0x9a0766d93b6608b7', // Standard Flow testnet address
      MockUSDC: '0x035662afa58bdc22', // Deployed to testnet
      DeFiActions: '0x035662afa58bdc22', // Deployed to testnet
      FungibleTokenConnectors: '0x035662afa58bdc22', // Deployed to testnet
    },
    mainnet: {
      Vaults: '0xMAINNET_ADDRESS_PLACEHOLDER',
      Registry: '0xMAINNET_ADDRESS_PLACEHOLDER',
      FungibleToken: '0xf233dcee88fe0abe',
      MockUSDC: '0xMAINNET_ADDRESS_PLACEHOLDER',
    },
  }
  return addresses[network]
}

/**
 * Optimized FCL configuration (client-side only)
 */
export function initializeFlowConfig(network: NetworkType) {
  // Only run on client side
  if (typeof window === 'undefined') {
    return NETWORK_CONFIGS[network]
  }

  const networkConfig = NETWORK_CONFIGS[network]
  const contractAddresses = getContractAddresses(network)

  const baseConfig = {
    // Network configuration
    'flow.network': network,
    'accessNode.api': networkConfig.accessNode,
    'discovery.wallet': networkConfig.discovery,

    // App metadata (new according to FCL docs)
    'app.detail.title': 'TrustFlow',
    'app.detail.icon': window.location.origin + '/assets/logo-square.svg',
    'app.detail.description': 'Chain-abstracted payouts for events. Atomic, audit-ready.',
    'app.detail.url': window.location.origin,

    // Transaction limits
    'fcl.limit': 1000,

    // Contract addresses (simplified approach)
    ...Object.fromEntries(
      Object.entries(contractAddresses).map(([name, address]) => [`0x${name}`, address]),
    ),

    // WalletConnect configuration (optional but recommended)
    ...(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
      ? {
          'walletconnect.projectId': process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
          'walletconnect.disableNotifications': false,
        }
      : {
          // Fallback configuration without WalletConnect
          'discovery.wallet.method': 'IFRAME/RPC',
        }),
  }

  // Configure FCL with base config
  config(baseConfig)

  // FCL configured successfully

  return networkConfig
}

export { NETWORK_CONFIGS }
