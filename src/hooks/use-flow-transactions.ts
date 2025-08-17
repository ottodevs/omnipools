import { useState, useCallback, useEffect } from 'react'
import * as fcl from '@onflow/fcl'

export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error'

export interface TransactionResult {
  status: TransactionStatus
  error?: string
  transactionId?: string
  events?: any[]
}

export const useFlowTransactions = () => {
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('idle')
  const [lastResult, setLastResult] = useState<TransactionResult | null>(null)
  const [user, setUser] = useState<any>({ loggedIn: false })

  useEffect(() => {
    // Subscribe to current user changes with direct FCL
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    return () => unsubscribe && unsubscribe()
  }, [])

  const executeTransaction = useCallback(async (
    cadence: string,
    args: any[] = [],
    options: { 
      proposer?: any
      authorizer?: any
      payer?: any
    } = {}
  ): Promise<TransactionResult> => {
    if (!user || !user.loggedIn) {
      const error = 'No user connected'
      setTransactionStatus('error')
      setLastResult({ status: 'error', error })
      return { status: 'error', error }
    }

    try {
      setTransactionStatus('pending')
      setLastResult(null)

      console.log('🚀 Executing transaction with user:', user.addr)
      console.log('📝 Cadence:', cadence.substring(0, 100) + '...')
      console.log('📊 Args:', args)

      // FIX: Use FCL.authz directly instead of user.authorization
      const transactionId = await fcl.mutate({
        cadence,
        args: (arg, t) => {
          // Convert args if they come in format [{value, type}]
          if (args.length > 0 && args[0]?.value !== undefined) {
            return args.map(a => arg(a.value, a.type))
          }
          // Or use args directly if they come as a function
          return typeof args === 'function' ? args(arg, t) : []
        },
        proposer: fcl.authz,      // ✅ FIX: Use fcl.authz
        payer: fcl.authz,         // ✅ FIX: Use fcl.authz  
        authorizations: [fcl.authz], // ✅ FIX: Use fcl.authz
        limit: 1000
      })

      console.log('🔄 Transaction submitted:', transactionId)

      // Wait for transaction confirmation
      const transaction = await fcl.tx(transactionId).onceSealed()
      
      console.log('✅ Transaction sealed:', transaction)

      const transactionResult: TransactionResult = {
        status: 'success',
        transactionId: transaction.transactionId,
        events: transaction.events
      }

      setTransactionStatus('success')
      setLastResult(transactionResult)
      return transactionResult

    } catch (error) {
      console.error('❌ Transaction error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed'
      const transactionResult: TransactionResult = {
        status: 'error',
        error: errorMessage
      }

      setTransactionStatus('error')
      setLastResult(transactionResult)
      return transactionResult
    }
  }, [user])

  const resetTransaction = useCallback(() => {
    setTransactionStatus('idle')
    setLastResult(null)
  }, [])

  return {
    executeTransaction,
    resetTransaction,
    transactionStatus,
    lastResult,
    isConnected: !!currentUser
  }
} 