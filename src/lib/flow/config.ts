import { config } from '@onflow/fcl'

export type NetworkType = 'local' | 'testnet' | 'mainnet'

// Network configurations following official FCL documentation
const NETWORK_CONFIGS = {
  local: {
    accessNode: process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE_LOCAL ?? 'http://localhost:8888',
    discovery: 'https://fcl-discovery.onflow.org/local/authn',
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
    },
    testnet: {
      Vaults: '0xTESTNET_ADDRESS_PLACEHOLDER',
      Registry: '0xTESTNET_ADDRESS_PLACEHOLDER',
      FungibleToken: '0x9a0766d93b6608b7',
      MockUSDC: '0xTESTNET_ADDRESS_PLACEHOLDER',
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
    'app.detail.title': 'OmniPools',
    'app.detail.icon': '/assets/omnipools_banner_inline.png',
    'app.detail.description': 'Chain-abstracted payouts for events. Atomic, audit-ready.',
    'app.detail.url': window.location.origin,

    // Transaction limits
    'fcl.limit': 1000,

    // Contract addresses (simplified approach)
    ...Object.fromEntries(
      Object.entries(contractAddresses).map(([name, address]) => [`0x${name}`, address]),
    ),

    // WalletConnect configuration
    ...(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
      ? {
          'walletconnect.projectId': process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
          'walletconnect.disableNotifications': false,
        }
      : {}),
  }

  // Configure FCL with base config
  config(baseConfig)

  // FCL configured successfully

  return networkConfig
}

export { NETWORK_CONFIGS }
