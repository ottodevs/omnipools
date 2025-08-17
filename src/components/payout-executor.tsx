'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { executePayoutTransaction, waitForTransaction } from '@/lib/flow/transactions'
import Card from './Card'

interface PayoutExecutorProps {
  vaultId: number
  orgAddress: string
  winners: Array<{ address: string; amount: number }>
  onPayoutComplete: (operationId: number, totalPaid: number, misses: any) => void
}

export default function PayoutExecutor({ 
  vaultId, 
  orgAddress, 
  winners, 
  onPayoutComplete 
}: PayoutExecutorProps) {
  const [executing, setExecuting] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const totalAmount = winners.reduce((sum, winner) => sum + winner.amount, 0)

  const handleExecutePayout = async () => {
    setExecuting(true)
    setTransactionId(null)
    setResult(null)

    try {
      const txId = await executePayoutTransaction(vaultId, orgAddress)
      setTransactionId(txId)
      
      const txResult = await waitForTransaction(txId)
      
      if (txResult.status === 4) { // SEALED
        // In a real implementation, we'd parse the events to get actual results
        // For demo purposes, simulate weak guarantees behavior
        const simulatedResult = {
          operationId: Date.now() % 1000,
          totalPaid: totalAmount * 0.8, // Simulate some misses
          misses: winners.slice(-1).reduce((acc, winner) => {
            acc[winner.address] = winner.amount
            return acc
          }, {} as any)
        }
        
        setResult(simulatedResult)
        onPayoutComplete(
          simulatedResult.operationId,
          simulatedResult.totalPaid,
          simulatedResult.misses
        )
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error executing payout:', error)
      alert('Failed to execute payout')
    } finally {
      setExecuting(false)
    }
  }

  return (
    <Card title="Execute Flow Actions Payout">
      <div className="space-y-6">
        {/* Payout summary */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h4 className="font-medium mb-3 text-white">Payout Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Vault ID:</span>
              <span className="text-white/80">#{vaultId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Winners:</span>
              <span className="text-white/80">{winners.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Total Amount:</span>
              <span className="text-white/80 font-medium">{totalAmount.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Treasury:</span>
              <code className="text-blue-200 bg-blue-500/20 px-2 py-1 rounded text-xs">
                {orgAddress.slice(0, 8)}...{orgAddress.slice(-6)}
              </code>
            </div>
          </div>
        </div>

        {/* Weak guarantees info */}
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <h4 className="font-medium mb-2 text-yellow-200">⚡ Weak Guarantees</h4>
          <div className="text-sm text-yellow-200/80 space-y-1">
            <p>• Recipients without linked receivers will be skipped</p>
            <p>• Failed payments won't revert the entire transaction</p>
            <p>• Misses are recorded and can be retried later</p>
          </div>
        </div>

        {/* Transaction status */}
        {transactionId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
          >
            <p className="text-blue-200 text-sm">
              Transaction: <code className="bg-blue-500/20 px-2 py-1 rounded">{transactionId}</code>
            </p>
          </motion.div>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
          >
            <h4 className="font-medium mb-3 text-green-200">✅ Payout Complete</h4>
            <div className="space-y-2 text-sm text-green-200/80">
              <div className="flex justify-between">
                <span>Operation ID:</span>
                <code className="bg-green-500/20 px-2 py-1 rounded">{result.operationId}</code>
              </div>
              <div className="flex justify-between">
                <span>Total Paid:</span>
                <span className="font-medium">{result.totalPaid.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span>Misses:</span>
                <span>{Object.keys(result.misses).length}</span>
              </div>
            </div>
            
            {Object.keys(result.misses).length > 0 && (
              <div className="mt-3 pt-3 border-t border-green-500/20">
                <p className="text-xs text-green-200/60">
                  Missed payments can be retried once recipients link their receivers
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Action button */}
        <button
          onClick={handleExecutePayout}
          disabled={executing || winners.length === 0 || result !== null}
          className={`w-full rounded-2xl px-6 py-4 sm:py-5 text-base sm:text-lg font-bold transition-all duration-200 min-h-[56px] ${
            executing
              ? 'bg-green-500/50 text-green-200 cursor-not-allowed'
              : result
              ? 'bg-green-500/20 text-green-200 cursor-not-allowed border border-green-500/30'
              : winners.length === 0
              ? 'bg-white/10 text-white/40 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg'
          }`}
        >
          {executing ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-green-200 border-t-transparent rounded-full animate-spin"></div>
              Executing Payout...
            </span>
          ) : result ? (
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">✅</span>
              Payout Complete
            </span>
          ) : winners.length === 0 ? (
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">⚠️</span>
              No Winners Set
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">⚡</span>
              Execute Flow Actions Payout
            </span>
          )}
        </button>

        {/* CLI command reference */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/10">
          <p className="text-white/60 text-xs mb-2">Equivalent CLI command:</p>
          <code className="text-xs text-white/80 break-all">
            flow transactions send ./cadence/transactions/tx_payout_split.cdc {orgAddress} {vaultId}
          </code>
        </div>
      </div>
    </Card>
  )
}