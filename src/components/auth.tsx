'use client'

import { useFlowCurrentUser } from "@onflow/react-sdk"

function AuthComponent() {
    const { user, authenticate, unauthenticate } = useFlowCurrentUser()
  
    return (
      <div>
        {user?.loggedIn ? (
          <>
            <p>Logged in as {user?.addr}</p>
            <button onClick={unauthenticate}>Logout</button>
          </>
        ) : (
          <button onClick={authenticate}>Login</button>
        )}
      </div>
    )
  }

  export default AuthComponent