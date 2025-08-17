import { config } from '@onflow/fcl'
import flowJSON from '../../../flow.json'

export type NetworkType = 'local' | 'testnet' | 'mainnet'

// Network configurations siguiendo documentación oficial FCL
const NETWORK_CONFIGS = {
  local: {
    accessNode: process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE_LOCAL || 'http://localhost:8888',
    discovery: 'https://fcl-discovery.onflow.org/local/authn',
    network: 'local'
  },
  testnet: {
    accessNode: process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE_TESTNET || 'https://rest-testnet.onflow.org',
    discovery: 'https://fcl-discovery.onflow.org/testnet/authn',
    network: 'testnet'
  },
  mainnet: {
    accessNode: process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE_MAINNET || 'https://rest-mainnet.onflow.org',
    discovery: 'https://fcl-discovery.onflow.org/authn',
    network: 'mainnet'
  }
} as const

/**
 * Configuración optimizada FCL según documentación oficial
 * Usa config.load() con flow.json para automatic address replacement
 */
export const initializeFlowConfig = (network: NetworkType) => {
  const networkConfig = NETWORK_CONFIGS[network]
  
  const baseConfig = {
    // Network configuration
    'flow.network': network,
    'accessNode.api': networkConfig.accessNode,
    'discovery.wallet': networkConfig.discovery,
    
    // App metadata (nuevo según docs FCL)
    'app.detail.title': 'OmniPools',
    'app.detail.icon': '/assets/omnipools_banner_inline.png',
    'app.detail.description': 'Chain-abstracted payouts for events. Atomic, audit-ready.',
    'app.detail.url': typeof window !== 'undefined' ? window.location.origin : 'https://omnipools.app',
    
    // Transaction limits
    'fcl.limit': 1000,
    
    // WalletConnect configuration
    ...(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID && {
      'walletconnect.projectId': process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      'walletconnect.disableNotifications': false
    })
  }
  
  // ✨ KEY OPTIMIZATION: Usar config.load() con flow.json según documentación
  config(baseConfig).load({ flowJSON })
  
  console.log(`🔄 FCL configured for ${network}:`, {
    accessNode: networkConfig.accessNode,
    contractsLoaded: Object.keys(flowJSON.contracts || {}),
    network
  })
  
  return networkConfig
}

export { NETWORK_CONFIGS }