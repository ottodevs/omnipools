'use client'

import { FlowProvider } from "@onflow/react-sdk"
import flowJSON from "@/contracts/flow.json"

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FlowProvider
      config={{
        accessNodeUrl: "https://access-mainnet.onflow.org",
        flowNetwork: "mainnet",
        appDetailTitle: "My On Chain App",
        appDetailIcon: "https://example.com/icon.png",
        appDetailDescription: "A decentralized app on Flow",
        appDetailUrl: "https://myonchainapp.com",
      }}
          flowJson={flowJSON}
          colorMode="system"
    >
     {children}
    </FlowProvider>
  )
}

export default Providers
