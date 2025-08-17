import * as fcl from '@onflow/fcl'
import { CADENCE_SCRIPTS } from '@/lib/flow/scripts'

/**
 * Hook simplificado para interactuar con Flow usando FCL optimizado
 * Usa la nueva configuración con config.load() y scripts simplificados
 */
export const useFlowClient = () => {
  return {
    // Métodos principales de FCL
    query: fcl.query,
    mutate: fcl.mutate,
    authenticate: fcl.authenticate,
    unauthenticate: fcl.unauthenticate,
    currentUser: fcl.currentUser,
    
    // Scripts predefinidos optimizados
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