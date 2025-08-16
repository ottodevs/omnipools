'use client'

import { Connect } from "@onflow/react-sdk"

function ConnectComponent() {
    return (
        <Connect
          onConnect={() => console.log("Connected!")}
          onDisconnect={() => console.log("Logged out")}
        />
    )
}

export default ConnectComponent