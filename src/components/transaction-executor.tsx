"use client"

import { useState } from 'react'
import { useFlowTransactions } from '@/hooks/use-flow-transactions'

interface TransactionExecutorProps {
  title: string
  cadence: string
  args?: any[]
  buttonText?: string
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
}

export default function TransactionExecutor({
  title,
  cadence,
  args = [],
  buttonText = "Execute Transaction",
  onSuccess,
  onError
}: TransactionExecutorProps) {
  const { executeTransaction, transactionStatus, lastResult, isConnected } = useFlowTransactions()
  const [showDetails, setShowDetails] = useState(false)

  const handleExecute = async () => {
    console.log('🎯 Executing transaction:', title)
    console.log('📝 Cadence code:', cadence.substring(0, 200) + '...')
    console.log('📊 Arguments:', args)
    
    const result = await executeTransaction(cadence, args)
    
    if (result.status === 'success') {
      console.log('✅ Transaction successful:', result)
      onSuccess?.(result)
    } else if (result.status === 'error') {
      console.log('❌ Transaction failed:', result.error)
      onError?.(result.error || 'Transaction failed')
    }
  }

  const getStatusColor = () => {
    switch (transactionStatus) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-200'
      case 'success': return 'bg-green-500/20 text-green-200'
      case 'error': return 'bg-red-500/20 text-red-200'
      default: return 'bg-white/10 text-white/80'
    }
  }

  const getStatusText = () => {
    switch (transactionStatus) {
      case 'pending': return 'Pending...'
      case 'success': return 'Success'
      case 'error': return 'Error'
      default: return 'Ready'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-white/60 hover:text-white/80"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Cadence Code:
            </label>
            <pre className="overflow-auto rounded-xl bg-black/40 p-4 text-xs">
              {cadence}
            </pre>
          </div>

          {args.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Arguments:
              </label>
              <pre className="overflow-auto rounded-xl bg-black/40 p-4 text-xs">
                {JSON.stringify(args, null, 2)}
              </pre>
            </div>
          )}

          {lastResult && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Last Result:
              </label>
              <pre className="overflow-auto rounded-xl bg-black/40 p-4 text-xs">
                {JSON.stringify(lastResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleExecute}
          disabled={!isConnected || transactionStatus === 'pending'}
          className={`px-4 py-2 rounded-xl font-medium ${
            !isConnected || transactionStatus === 'pending'
              ? 'bg-white/5 text-white/40 cursor-not-allowed'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {transactionStatus === 'pending' ? 'Executing...' : buttonText}
        </button>

        {!isConnected && (
          <span className="text-sm text-white/60 flex items-center">
            Connect wallet to execute transactions
          </span>
        )}
      </div>
    </div>
  )
} 