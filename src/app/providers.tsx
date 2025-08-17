'use client'

import { NetworkProvider } from '@/lib/contexts/network-context'

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      {children}
    </NetworkProvider>
  )
}

export default Providers
