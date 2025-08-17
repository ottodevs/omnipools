/**
 * Vault Funding Dialog with Fern Integration
 * Seamlessly integrates fiat-to-crypto conversion into vault funding
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useFernCustomer, useFernCurrencyConversion } from '@/hooks/use-fern'
import Card from './Card'

interface VaultFundingDialogProps {
  isOpen: boolean
  onClose: () => void
  vaultId: number
  targetAmount?: number
  onFundingComplete: (amount: number, currency: string, method: 'crypto' | 'fiat') => void
}

const FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
]

export default function VaultFundingDialog({
  isOpen,
  onClose,
  vaultId,
  targetAmount = 1000,
  onFundingComplete,
}: VaultFundingDialogProps) {
  const [fundingMethod, setFundingMethod] = useState<'crypto' | 'fiat'>('fiat')
  const [amount, setAmount] = useState(targetAmount.toString())
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(false)
  
  const { customer, createCustomer } = useFernCustomer()
  const { getExchangeRate, getQuote, executeTransaction } = useFernCurrencyConversion()
  const [exchangeRate, setExchangeRate] = useState<string>('')
  const [usdcAmount, setUsdcAmount] = useState('')

  // Get exchange rate when currency or amount changes
  useEffect(() => {
    if (fundingMethod === 'fiat' && currency !== 'USDC') {
      getExchangeRate(currency, 'USDC')
        .then(({ rate }) => {
          setExchangeRate(rate)
          const converted = (parseFloat(amount) * parseFloat(rate)).toFixed(2)
          setUsdcAmount(converted)
        })
        .catch(console.error)
    } else {
      setUsdcAmount(amount)
    }
  }, [currency, amount, fundingMethod, getExchangeRate])

  const handleFundVault = async () => {
    setLoading(true)
    
    try {
      if (fundingMethod === 'fiat') {
        // Fern fiat-to-crypto conversion flow
        if (!customer) {
          // Quick customer creation for demo
          await createCustomer({
            email: 'user@omnipools.com',
            type: 'individual',
            firstName: 'Pool',
            lastName: 'Creator'
          })
        }

        console.log(`Converting ${amount} ${currency} to USDC for vault ${vaultId}`)
        
        // Simulate Fern conversion process
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        onFundingComplete(parseFloat(usdcAmount), 'USDC', 'fiat')
      } else {
        // Direct crypto funding
        console.log(`Funding vault ${vaultId} with ${amount} USDC`)
        onFundingComplete(parseFloat(amount), 'USDC', 'crypto')
      }
      
      onClose()
    } catch (error) {
      console.error('Funding failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0f1729] border border-white/10 rounded-2xl max-w-md w-full mx-4 p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Fund Vault #{vaultId}</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Funding Method Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Funding Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFundingMethod('fiat')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  fundingMethod === 'fiat'
                    ? 'border-blue-500 bg-blue-500/20 text-blue-200'
                    : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                💳 Fiat Currency
              </button>
              <button
                onClick={() => setFundingMethod('crypto')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  fundingMethod === 'crypto'
                    ? 'border-blue-500 bg-blue-500/20 text-blue-200'
                    : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                🪙 USDC Direct
              </button>
            </div>
          </div>

          {/* Currency Selection (for fiat) */}
          {fundingMethod === 'fiat' && (
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FIAT_CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code} className="bg-gray-800">
                    {curr.flag} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount ({fundingMethod === 'fiat' ? currency : 'USDC'})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Conversion Preview (for fiat) */}
          {fundingMethod === 'fiat' && exchangeRate && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/60">You pay:</span>
                  <span className="text-white">{amount} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Vault receives:</span>
                  <span className="text-blue-200 font-medium">{usdcAmount} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Rate:</span>
                  <span className="text-white/80">1 {currency} = {parseFloat(exchangeRate).toFixed(4)} USDC</span>
                </div>
              </div>
            </div>
          )}

          {/* Fern Integration Notice */}
          {fundingMethod === 'fiat' && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-sm text-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <span>🌿</span>
                  <span className="font-medium">Powered by Fern</span>
                </div>
                <div className="text-green-200/80">
                  Secure fiat-to-crypto conversion with global compliance and automatic bridging to Flow.
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleFundVault}
              disabled={loading || !amount}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {fundingMethod === 'fiat' ? 'Converting...' : 'Funding...'}
                </span>
              ) : (
                `Fund with ${fundingMethod === 'fiat' ? currency : 'USDC'}`
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}