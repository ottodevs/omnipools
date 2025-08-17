'use client'

import type { NetworkType } from '@/lib/contexts/network-context'
import { useState } from 'react'
import { useNetwork } from '@/lib/contexts/network-context'

const NETWORKS = [
  { id: 'local' as NetworkType, name: 'Local Emulator', description: 'http://localhost:8888' },
  { id: 'testnet' as NetworkType, name: 'Testnet', description: 'https://rest-testnet.onflow.org' },
  { id: 'mainnet' as NetworkType, name: 'Mainnet', description: 'https://rest-mainnet.onflow.org' },
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

      // Show success notification
      console.log(`Switched to ${networkId} network`)

      // Instead of reloading, use timeout to let React finish updating
      setTimeout(() => {
        setIsLoading(false)
        setIsOpen(false)
      }, 500)
    }
    catch (error) {
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
        className={`
          flex min-h-[48px] items-center gap-2 rounded-xl border border-white/20 bg-white/10 p-3 text-white
          hover:bg-white/20
          disabled:cursor-not-allowed disabled:opacity-50
          sm:px-4
        `}
      >
        <div className={`
          size-3 rounded-full
          ${!isHydrated ? 'bg-gray-500' : getNetworkStatusColor()}
        `}
        />
        <span className={`
          text-sm font-medium
          sm:text-base
        `}
        >
          {!isHydrated ? 'Loading...' : isLoading ? 'Switching...' : NETWORKS.find(n => n.id === currentNetwork)?.name || currentNetwork}
        </span>
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !isLoading && isHydrated && (
        <div className={`
          absolute top-full right-0 z-50 mt-2 min-w-72 rounded-xl border border-white/10 bg-[#1a1f2e] p-3 shadow-xl
          backdrop-blur-md
          sm:min-w-80
        `}
        >
          <div className="border-b border-white/10 p-3 text-sm text-white/60">
            <div className="font-medium">Select Network</div>
            {isAuthenticated && (
              <div className="mt-2 text-xs text-yellow-400">
                ⚠️ Switching will disconnect wallet
              </div>
            )}
          </div>
          {NETWORKS.map(network => (
            <button
              key={network.id}
              className={`
                min-h-[48px] w-full rounded-lg p-4 text-left text-base font-medium transition-colors
                hover:bg-white/10
                ${
            network.id === currentNetwork ? 'border border-white/20 bg-white/10 text-white' : 'text-white/80'
            }
              `}
              onClick={async () => handleNetworkSwitch(network.id)}
            >
              <div className="flex items-center gap-2">
                <div className={`
                  size-1.5 rounded-full
                  ${
            network.id === 'local'
              ? 'bg-blue-500'
              : network.id === 'testnet'
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }
                `}
                />
                <div className="font-medium">{network.name}</div>
                {network.id === currentNetwork && (
                  <div className="ml-auto text-green-400">✓</div>
                )}
              </div>
              <div className="ml-4 text-xs text-white/60">{network.description}</div>
            </button>
          ))}
          <div className="border-t border-white/10 px-3 py-2 text-xs text-white/40">
            Changes saved automatically
          </div>
        </div>
      )}
    </div>
  )
}
