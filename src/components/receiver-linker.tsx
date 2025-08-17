'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNetwork } from '@/lib/contexts/network-context'
import { linkUSDCReceiverTransaction, waitForTransaction } from '@/lib/flow/transactions'
import Card from './Card'

interface ReceiverLinkerProps {
  onStatusChange: (isLinked: boolean) => void
}

export default function ReceiverLinker({ onStatusChange }: ReceiverLinkerProps) {
  const { isAuthenticated, user } = useNetwork()
  const [isLinked, setIsLinked] = useState(false)
  const [linking, setLinking] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  // Load linked status from localStorage (in production, would check on-chain)
  useEffect(() => {
    if (user?.addr) {
      const linkedStatus = localStorage.getItem(`receiver-linked-${user.addr}`)
      setIsLinked(linkedStatus === 'true')
    }
  }, [user?.addr])

  const handleLinkReceiver = async () => {
    if (!isAuthenticated || !user?.addr) {
      alert('Please connect your wallet first')
      return
    }

    setLinking(true)
    setTransactionId(null)

    try {
      const txId = await linkUSDCReceiverTransaction()
      setTransactionId(txId)
      
      const result = await waitForTransaction(txId)
      
      if (result.status === 4) { // SEALED
        setIsLinked(true)
        localStorage.setItem(`receiver-linked-${user.addr}`, 'true')
        onStatusChange(true)
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error linking receiver:', error)
      alert('Failed to link USDC receiver')
    } finally {
      setLinking(false)
    }
  }

  const handleUnlink = () => {
    if (user?.addr) {
      setIsLinked(false)
      localStorage.removeItem(`receiver-linked-${user.addr}`)
      onStatusChange(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card title="Link USDC Receiver">
        <div className="text-center py-8">
          <p className="text-white/60 mb-4">Connect your wallet to link a USDC receiver</p>
          <div className="text-4xl mb-4">🔗</div>
          <p className="text-sm text-white/40">
            This allows you to receive USDC payouts from pools
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card title="Link USDC Receiver">
      <div className="space-y-6">
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: isLinked ? 1.1 : 1,
              rotate: isLinked ? [0, 10, -10, 0] : 0
            }}
            transition={{ duration: 0.5 }}
            className="text-6xl mb-4"
          >
            {isLinked ? '✅' : '🔗'}
          </motion.div>
          
          <h3 className={`text-lg font-semibold mb-2 ${
            isLinked ? 'text-green-200' : 'text-white'
          }`}>
            {isLinked ? 'USDC Receiver Linked!' : 'Link USDC Receiver'}
          </h3>
          
          <p className="text-white/60 text-sm mb-4">
            {isLinked 
              ? 'You can now receive USDC payouts from pools'
              : 'Link your USDC receiver to participate in payouts'
            }
          </p>
        </div>

        {/* Account info */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/60">Account:</span>
            <code className="text-blue-200 bg-blue-500/20 px-2 py-1 rounded">
              {user.addr?.slice(0, 8)}...{user.addr?.slice(-6)}
            </code>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-white/60">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              isLinked 
                ? 'bg-green-500/20 text-green-200' 
                : 'bg-yellow-500/20 text-yellow-200'
            }`}>
              {isLinked ? 'Ready to receive' : 'Not linked'}
            </span>
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

        {/* Action button */}
        <div className="flex gap-3">
          {!isLinked ? (
            <button
              onClick={handleLinkReceiver}
              disabled={linking}
              className={`flex-1 rounded-2xl px-6 py-4 sm:py-5 text-base sm:text-lg font-bold transition-all duration-200 min-h-[56px] ${
                linking
                  ? 'bg-blue-500/50 text-blue-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg'
              }`}
            >
              {linking ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
                  Linking on Flow...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">🔗</span>
                  Link USDC Receiver
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={handleUnlink}
              className="flex-1 rounded-2xl px-6 py-4 sm:py-5 text-base sm:text-lg font-bold bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all duration-200 min-h-[56px] border border-red-500/30"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-xl">🔓</span>
                Unlink (Demo)
              </span>
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-white/40 space-y-1">
          <p>• This creates a USDC vault and publishes a receiver capability</p>
          <p>• Organizers can then send USDC directly to your account</p>
          <p>• Transaction requires small amount of FLOW for fees</p>
        </div>
      </div>
    </Card>
  )
}