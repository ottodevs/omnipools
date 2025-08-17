'use client'

import { useNetwork } from '@/lib/contexts/network-context'
import NetworkSelector from './network-selector'

export default function FlowConnect() {
  const { authenticate, unauthenticate, isAuthenticated, user, networkConfig, isHydrated } = useNetwork()

  const isConnected = isAuthenticated

  // Don't show sensitive client information until after hydration
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-gray-500" />
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
    <div className="rounded-2xl bg-white/5 p-4 sm:p-6 border border-white/10 backdrop-blur-sm">
      {/* Mobile-first layout */}
      <div className="space-y-4">
        {/* Connection status - Mobile first */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`
              w-4 h-4 rounded-full
              ${isConnected ? 'bg-green-500' : 'bg-red-500'}
            `}
            />
            <span className="text-base sm:text-lg font-medium text-white">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {/* Network selector - Always visible */}
          <div className="flex-shrink-0">
            <NetworkSelector />
          </div>
        </div>

        {/* Account info or connect button */}
        {isConnected ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <div className="text-base text-white/80">
                  <span className="text-white/60">Account: </span>
                  <code className="rounded-lg bg-white/10 px-3 py-2 text-sm sm:text-base font-mono">
                    {user?.addr ? `${user.addr.slice(0, 8)}...${user.addr.slice(-6)}` : 'Loading...'}
                  </code>
                </div>
              </div>
              <button
                onClick={unauthenticate}
                className="rounded-xl bg-red-500/20 px-4 py-3 text-base font-medium text-red-200 hover:bg-red-500/30 transition-all min-h-[48px] border border-red-500/30"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={async () => {
              try {
                await authenticate()
              } catch (error) {
                console.error('Authentication error:', error)
              }
            }}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-base sm:text-lg font-semibold text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-h-[56px] shadow-lg"
          >
            🔗 Connect Wallet
          </button>
        )}

        {/* Access node info - Collapsible on mobile */}
        <details className="text-sm text-white/60">
          <summary className="cursor-pointer hover:text-white/80 transition-colors py-2">
            Network Details
          </summary>
          <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs sm:text-sm">
              <div className="mb-1">
                <span className="font-medium">Access Node:</span>
              </div>
              <code className="break-all text-blue-200">
                {networkConfig.accessNode}
              </code>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
