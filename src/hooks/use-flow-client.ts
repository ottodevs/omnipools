import * as fcl from '@onflow/fcl'
import { CADENCE_SCRIPTS } from '@/lib/flow/scripts'

/**
 * Simplified hook for interacting with Flow using optimized FCL
 * Uses the new configuration with config.load() and simplified scripts
 */
export const useFlowClient = () => {
  return {
    // Main FCL methods
    query: fcl.query,
    mutate: fcl.mutate,
    authenticate: fcl.authenticate,
    unauthenticate: fcl.unauthenticate,
    currentUser: fcl.currentUser,
    
    // Optimized predefined scripts
    scripts: CADENCE_SCRIPTS,
    
    // Utilities
    decode: fcl.decode,
    send: fcl.send,
    tx: fcl.tx,
    
    // Authorization helper (nuevo)
    authz: fcl.authz,
    
    // Configuration helper
    config: fcl.config
  }
}