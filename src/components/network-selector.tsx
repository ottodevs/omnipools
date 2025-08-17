"use client"

import { useState } from 'react'
import { useNetwork, type NetworkType } from '@/lib/contexts/network-context'

const NETWORKS = [
  { id: 'local' as NetworkType, name: 'Local Emulator', description: 'http://localhost:8888' },
  { id: 'testnet' as NetworkType, name: 'Testnet', description: 'https://rest-testnet.onflow.org' },
  { id: 'mainnet' as NetworkType, name: 'Mainnet', description: 'https://rest-mainnet.onflow.org' }
]

export default function NetworkSelector() {
  const { currentNetwork, networkConfig, switchNetwork, isAuthenticated, isHydrated } = useNetwork()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleNetworkSwitch = async (networkId: NetworkType) => {
    if (networkId === currentNetwork) {
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      await switchNetwork(networkId)
      
      // Mostrar notificación de éxito
      console.log(`Switched to ${networkId} network`)
      
      // En lugar de recargar, usar un timeout para permitir que React termine de actualizar
      setTimeout(() => {
        setIsLoading(false)
        setIsOpen(false)
      }, 500)
    } catch (error) {
      console.error('Error switching network:', error)
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  const getNetworkStatusColor = () => {
    switch (currentNetwork) {
      case 'local': return 'bg-blue-500'
      case 'testnet': return 'bg-yellow-500'
      case 'mainnet': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || !isHydrated}
        className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className={`w-2 h-2 rounded-full ${!isHydrated ? 'bg-gray-500' : getNetworkStatusColor()}`} />
        <span className="text-sm font-medium">
          {!isHydrated ? 'Loading...' : isLoading ? 'Switching...' : networkConfig.name}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !isLoading && isHydrated && (
        <div className="absolute top-full mt-2 right-0 bg-[#1a1f2e] border border-white/10 rounded-xl p-2 min-w-64 z-50">
          <div className="text-xs text-white/60 px-3 py-2 border-b border-white/10">
            Select Network
            {isAuthenticated && (
              <div className="text-yellow-400 mt-1">
                Switching will disconnect wallet
              </div>
            )}
          </div>
          {NETWORKS.map((network) => (
            <button
              key={network.id}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors ${
                network.id === currentNetwork ? 'bg-white/10 text-white' : 'text-white/80'
              }`}
              onClick={() => handleNetworkSwitch(network.id)}
            >
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  network.id === 'local' ? 'bg-blue-500' :
                  network.id === 'testnet' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <div className="font-medium">{network.name}</div>
                {network.id === currentNetwork && (
                  <div className="ml-auto text-green-400">✓</div>
                )}
              </div>
              <div className="text-xs text-white/60 ml-4">{network.description}</div>
            </button>
          ))}
          <div className="text-xs text-white/40 px-3 py-2 border-t border-white/10">
            Changes saved automatically
          </div>
        </div>
      )}
    </div>
  )
} 