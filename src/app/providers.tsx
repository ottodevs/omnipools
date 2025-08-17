'use client'

// Importar la configuración de Flow para inicializarlo
import '@/lib/flow/client'
import { NetworkProvider } from '@/lib/contexts/network-context'

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      {children}
    </NetworkProvider>
  )
}

export default Providers
