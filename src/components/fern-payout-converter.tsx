/**
 * Fern Payout Converter Component
 * Converts USDC payouts to fiat currency for winners
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Card from './Card'
import { useFernCurrencyConversion } from '@/hooks/use-fern'

interface PayoutConverterProps {
  winners: Array<{ address: string; amount: number }>
  onPayoutConversion?: (conversions: any[]) => void
}

const FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
]

export default function FernPayoutConverter({
  winners,
  onPayoutConversion,
}: PayoutConverterProps) {
  const { getExchangeRate } = useFernCurrencyConversion()
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [exchangeRate, setExchangeRate] = useState<string>('')
  const [conversions, setConversions] = useState<Array<{
    address: string
    usdcAmount: number
    fiatAmount: number
    currency: string
  }>>([])
  const [loading, setLoading] = useState(false)

  // Calculate conversions when currency or winners change
  useEffect(() => {
    if (winners.length > 0 && selectedCurrency) {
      updateConversions()
    }
  }, [winners, selectedCurrency])

  const updateConversions = async () => {
    setLoading(true)
    try {
      const { rate } = await getExchangeRate('USDC', selectedCurrency)
      setExchangeRate(rate)
      
      const newConversions = winners.map(winner => ({
        address: winner.address,
        usdcAmount: winner.amount,
        fiatAmount: winner.amount * parseFloat(rate),
        currency: selectedCurrency,
      }))
      
      setConversions(newConversions)
    } catch (error) {
      console.error('Failed to get exchange rate:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalUSDC = winners.reduce((sum, winner) => sum + winner.amount, 0)
  const totalFiat = conversions.reduce((sum, conversion) => sum + conversion.fiatAmount, 0)

  const handleExecuteConversions = async () => {
    if (conversions.length === 0) return

    setLoading(true)
    try {
      // In a real implementation, you would:
      // 1. Create Fern customers for each winner (if they don't exist)
      // 2. Create wallets for each winner
      // 3. Get quotes for each conversion
      // 4. Execute the conversions
      // 5. Handle the fiat payouts
      
      console.log('Executing payout conversions:', conversions)
      
      // Simulate conversion execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      onPayoutConversion?.(conversions)
      
      alert('Payout conversions initiated! Winners will receive fiat payments.')
    } catch (error) {
      console.error('Failed to execute conversions:', error)
      alert('Failed to execute conversions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (winners.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">💸</div>
          <div>No winners to convert payouts for</div>
          <div className="text-sm mt-1">Set winners first to enable fiat conversions</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Fern Payout Converter</h3>
        <div className="text-xs text-gray-500">
          Convert USDC prizes to fiat
        </div>
      </div>

      <div className="space-y-6">
        {/* Currency Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Convert payouts to</label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {FIAT_CURRENCIES.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.flag} {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Exchange Rate Display */}
        {exchangeRate && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-700">
              Exchange Rate: 1 USDC = {parseFloat(exchangeRate).toFixed(4)} {selectedCurrency}
            </div>
          </div>
        )}

        {/* Conversion Summary */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Conversion Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Total USDC</div>
              <div className="font-semibold">{totalUSDC.toLocaleString()} USDC</div>
            </div>
            <div>
              <div className="text-gray-600">Total {selectedCurrency}</div>
              <div className="font-semibold">{totalFiat.toLocaleString()} {selectedCurrency}</div>
            </div>
          </div>
        </div>

        {/* Winners Conversion List */}
        <div>
          <h4 className="font-medium mb-3">Winner Payouts</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {conversions.map((conversion, index) => (
              <motion.div
                key={conversion.address}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 border rounded-lg bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-gray-600 truncate">
                      {conversion.address}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-medium">
                      {conversion.usdcAmount} USDC → {conversion.fiatAmount.toFixed(2)} {conversion.currency}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleExecuteConversions}
          disabled={loading || conversions.length === 0}
          className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Converting Payouts...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              💸 Convert {conversions.length} Payouts to {selectedCurrency}
            </span>
          )}
        </button>

        {/* Info Box */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>How it works:</strong> Fern will automatically convert USDC prizes to {selectedCurrency} 
            and send fiat payments directly to winners' bank accounts. Winners will receive KYC links to complete verification.
          </div>
        </div>
      </div>
    </Card>
  )
}