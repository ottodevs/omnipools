'use client'

import type { ReactNode } from 'react'
import type { NetworkType } from '../flow/config'
import * as fcl from '@onflow/fcl'
import { createContext, use, useEffect, useState } from 'react'
import { initializeFlowConfig, NETWORK_CONFIGS } from '../flow/config'

// Re-export NetworkType for convenience
export type { NetworkType }

interface NetworkContextType {
  currentNetwork: NetworkType
  networkConfig: typeof NETWORK_CONFIGS[NetworkType]
  switchNetwork: (network: NetworkType) => void
  isAuthenticated: boolean
  user: any
  authenticate: () => void
  unauthenticate: () => void
  isHydrated: boolean
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  const serverNetwork = (process.env.NEXT_PUBLIC_FLOW_NETWORK as NetworkType) || 'local'
  const [currentNetwork, setCurrentNetwork] = useState<NetworkType>(serverNetwork)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  // Safe hydration: sync with localStorage only after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flow-network') as NetworkType
      if (saved && NETWORK_CONFIGS[saved]) {
        setCurrentNetwork(saved)
      }
      setIsHydrated(true)
    }
  }, [])

  const networkConfig = NETWORK_CONFIGS[currentNetwork]

  // ✨ OPTIMIZATION: Configure FCL using new optimized architecture
  useEffect(() => {
    if (isHydrated) {
      console.log('🔄 Initializing FCL for network:', currentNetwork)
      try {
        const config = initializeFlowConfig(currentNetwork)
        console.log('✅ FCL configured successfully:', config)
      } catch (error) {
        console.error('❌ FCL configuration failed:', error)
      }
    }
  }, [currentNetwork, isHydrated])

  // Subscribe to authentication changes
  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe((user: any) => {
      setUser(user)
      setIsAuthenticated(user?.loggedIn || false)
    })

    return () => unsubscribe()
  }, [])

  const switchNetwork = async (network: NetworkType) => {
    // If user is authenticated, unauthenticate first
    if (isAuthenticated) {
      await fcl.unauthenticate()
    }

    // Switch network
    setCurrentNetwork(network)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('flow-network', network)
    }

    // FCL configuration is handled automatically in useEffect
    console.log('🔄 Switched to network:', network)
  }

  const authenticate = async () => {
    try {
      console.log('🔐 Starting authentication for network:', currentNetwork)
      console.log('🔧 Current FCL config:')
      console.log('  - Access Node:', await fcl.config().get('accessNode.api'))
      console.log('  - Discovery Wallet:', await fcl.config().get('discovery.wallet'))
      console.log('  - Flow Network:', await fcl.config().get('flow.network'))
      
      // Clear any existing authentication first
      await fcl.unauthenticate()
      
      // Small delay to ensure clean state
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Start authentication
      console.log('🚀 Calling fcl.authenticate()...')
      await fcl.authenticate()
      console.log('✅ Authentication successful')
    } catch (error) {
      console.error('❌ Authentication failed:', error)
      
      // Provide user-friendly error message
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage?.includes('User rejected')) {
        console.log('ℹ️ User cancelled wallet connection')
      } else if (errorMessage?.includes('locked')) {
        alert('Please unlock your Flow wallet and try again')
      } else {
        console.error('Full error details:', error)
        alert('Wallet connection failed. Please try switching to local network or check your wallet. Check browser console for details.')
      }
    }
  }

  const unauthenticate = async () => {
    try {
      console.log('🔓 Starting unauthentication')
      await fcl.unauthenticate()
      console.log('✅ Unauthentication successful')
    } catch (error) {
      console.error('❌ Unauthentication failed:', error)
    }
  }

  return (
    <NetworkContext value={{
      currentNetwork,
      networkConfig,
      switchNetwork,
      isAuthenticated,
      user,
      authenticate,
      unauthenticate,
      isHydrated,
    }}
    >
      {children}
    </NetworkContext>
  )
}

export function useNetwork() {
  const context = use(NetworkContext)
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}
