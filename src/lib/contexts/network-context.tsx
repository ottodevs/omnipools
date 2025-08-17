"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { initializeFlowConfig, NetworkType, NETWORK_CONFIGS } from '../flow/config'
import * as fcl from '@onflow/fcl'

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

  // Hidratación segura: sincronizar con localStorage solo después del mount
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

  // ✨ OPTIMIZACIÓN: Configurar FCL usando nueva arquitectura optimizada
  useEffect(() => {
    if (isHydrated) {
      console.log('🔄 Initializing FCL for network:', currentNetwork)
      initializeFlowConfig(currentNetwork)
    }
  }, [currentNetwork, isHydrated])

  // Suscribirse a cambios de autenticación
  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe((user: any) => {
      setUser(user)
      setIsAuthenticated(user?.loggedIn || false)
    })

    return () => unsubscribe()
  }, [])

  const switchNetwork = async (network: NetworkType) => {
    // Si el usuario está autenticado, desautenticar primero
    if (isAuthenticated) {
      await fcl.unauthenticate()
    }

    // Cambiar red
    setCurrentNetwork(network)
    
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('flow-network', network)
    }
    
    // La configuración FCL se maneja automáticamente en el useEffect
    console.log('🔄 Switched to network:', network)
  }

  const authenticate = () => {
    fcl.authenticate()
  }

  const unauthenticate = () => {
    fcl.unauthenticate()
  }

  return (
    <NetworkContext.Provider value={{
      currentNetwork,
      networkConfig,
      switchNetwork,
      isAuthenticated,
      user,
      authenticate,
      unauthenticate,
      isHydrated
    }}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}