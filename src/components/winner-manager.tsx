'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { setWinnersTransaction, waitForTransaction } from '@/lib/flow/transactions'
import Card from './Card'

interface Winner {
  address: string
  amount: number
}

interface WinnerManagerProps {
  vaultId: number
  onWinnersUpdated: (winners: Winner[]) => void
}

export default function WinnerManager({ vaultId, onWinnersUpdated }: WinnerManagerProps) {
  const [winners, setWinners] = useState<Winner[]>([
    { address: '', amount: 0 }
  ])
  const [submitting, setSubmitting] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const addWinner = () => {
    setWinners([...winners, { address: '', amount: 0 }])
  }

  const removeWinner = (index: number) => {
    if (winners.length > 1) {
      setWinners(winners.filter((_, i) => i !== index))
    }
  }

  const updateWinner = (index: number, field: keyof Winner, value: string | number) => {
    const updated = winners.map((winner, i) => 
      i === index ? { ...winner, [field]: value } : winner
    )
    setWinners(updated)
  }

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{16}$/.test(address)
  }

  const canSubmit = winners.every(w => 
    isValidAddress(w.address) && w.amount > 0
  ) && winners.length > 0

  const totalAmount = winners.reduce((sum, winner) => sum + winner.amount, 0)

  const handleSubmit = async () => {
    if (!canSubmit) return

    setSubmitting(true)
    setTransactionId(null)

    try {
      const txId = await setWinnersTransaction(vaultId, winners)
      setTransactionId(txId)
      
      const result = await waitForTransaction(txId)
      
      if (result.status === 4) { // SEALED
        onWinnersUpdated(winners)
        // Success feedback would be handled by parent
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error setting winners:', error)
      alert('Failed to set winners on-chain')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card title={`Configure Winners - Vault #${vaultId}`}>
      <div className="space-y-6">
        <div className="space-y-4">
          <AnimatePresence>
            {winners.map((winner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-base font-semibold text-white mb-3">
                      Winner Address
                    </label>
                    <input
                      type="text"
                      value={winner.address}
                      onChange={(e) => updateWinner(index, 'address', e.target.value)}
                      placeholder="0x1234567890123456"
                      className={`w-full rounded-2xl bg-white/5 border p-4 sm:p-5 text-base text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all min-h-[56px] ${
                        winner.address && !isValidAddress(winner.address)
                          ? 'border-red-500 focus:ring-red-500/50'
                          : 'border-white/10 focus:ring-blue-500/50'
                      }`}
                    />
                    {winner.address && !isValidAddress(winner.address) && (
                      <p className="text-red-400 text-sm mt-2">Invalid Flow address format</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-base font-semibold text-white mb-3">
                      Amount (USDC)
                    </label>
                    <input
                      type="number"
                      value={winner.amount || ''}
                      onChange={(e) => updateWinner(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 text-base text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[56px]"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => removeWinner(index)}
                      disabled={winners.length === 1}
                      className={`w-full rounded-2xl px-4 py-4 text-base font-bold transition-all min-h-[56px] ${
                        winners.length === 1
                          ? 'bg-white/5 text-white/30 cursor-not-allowed'
                          : 'bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/30'
                      }`}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <button
            onClick={addWinner}
            className="w-full rounded-2xl bg-white/10 border-2 border-dashed border-white/20 p-6 text-base sm:text-lg font-semibold text-white/70 hover:bg-white/20 hover:border-white/30 transition-all min-h-[64px] hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">➕</span>
              Add Winner
            </span>
          </button>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-200">Total Winners:</span>
            <span className="text-blue-100 font-medium">{winners.length}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-blue-200">Total Amount:</span>
            <span className="text-blue-100 font-medium">{totalAmount.toFixed(2)} USDC</span>
          </div>
        </div>

        {/* Transaction status */}
        {transactionId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
          >
            <p className="text-green-200 text-sm">
              Transaction: <code className="bg-green-500/20 px-2 py-1 rounded">{transactionId}</code>
            </p>
          </motion.div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className={`w-full rounded-2xl px-6 py-4 sm:py-5 text-base sm:text-lg font-bold transition-all duration-200 min-h-[56px] ${
            submitting
              ? 'bg-blue-500/50 text-blue-200 cursor-not-allowed'
              : canSubmit
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
              Setting Winners on Flow...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">⚡</span>
              Set Winners on Chain
            </span>
          )}
        </button>
      </div>
    </Card>
  )
}