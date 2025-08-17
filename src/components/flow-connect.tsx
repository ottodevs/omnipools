"use client"

import { useNetwork } from '@/lib/contexts/network-context'
import NetworkSelector from './network-selector'

export default function FlowConnect() {
  const { authenticate, unauthenticate, isAuthenticated, user, networkConfig, isHydrated } = useNetwork()

  const isConnected = isAuthenticated

  // No mostrar información sensible al cliente hasta después de la hidratación
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span className="text-sm text-white/80">Loading...</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-sm text-white/60">
            Initializing...
          </div>
          <NetworkSelector />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-white/80">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {isConnected ? (
          <div className="flex items-center gap-2">
            <div className="text-sm text-white/80">
              <span className="text-white/60">Account: </span>
              <code className="bg-white/10 px-2 py-1 rounded">
                {user.addr?.slice(0, 8)}...{user.addr?.slice(-6)}
              </code>
            </div>
            <button
              onClick={unauthenticate}
              className="text-xs bg-red-500/20 text-red-200 px-2 py-1 rounded hover:bg-red-500/30"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={authenticate}
            className="text-sm bg-blue-500/20 text-blue-200 px-3 py-1 rounded hover:bg-blue-500/30"
          >
            Connect Wallet
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-sm text-white/60">
          Access Node: {networkConfig.accessNode}
        </div>
        <NetworkSelector />
      </div>
    </div>
  )
} 