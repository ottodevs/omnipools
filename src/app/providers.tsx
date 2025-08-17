'use client'

import { NetworkProvider } from '@/lib/contexts/network-context'
import { RoleProvider } from '@/lib/contexts/role-context'

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      <RoleProvider>
        {children}
      </RoleProvider>
    </NetworkProvider>
  )
}

export default Providers
