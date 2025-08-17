/**
 * Fern Currency Converter Component
 * Enables currency conversion and fiat-to-crypto onramps
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Card from './Card'
import { useFernCustomer, useFernWallets, useFernCurrencyConversion } from '@/hooks/use-fern'

interface CurrencyConverterProps {
  onConversionComplete?: (transaction: any) => void
  defaultSourceCurrency?: string
  defaultDestinationCurrency?: string
  defaultAmount?: string
}

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', type: 'fiat' },
  { code: 'EUR', name: 'Euro', type: 'fiat' },
  { code: 'GBP', name: 'British Pound', type: 'fiat' },
  { code: 'USDC', name: 'USD Coin', type: 'crypto' },
  { code: 'USDT', name: 'Tether', type: 'crypto' },
  { code: 'ETH', name: 'Ethereum', type: 'crypto' },
]

const PAYMENT_METHODS = {
  USD: ['ACH', 'Wire'],
  EUR: ['SEPA'],
  GBP: ['FasterPayments'],
  USDC: ['Ethereum', 'Polygon', 'Arbitrum', 'Base', 'Optimism'],
  USDT: ['Ethereum', 'Polygon', 'Arbitrum'],
  ETH: ['Ethereum'],
}

export default function FernCurrencyConverter({
  onConversionComplete,
  defaultSourceCurrency = 'USD',
  defaultDestinationCurrency = 'USDC',
  defaultAmount = '',
}: CurrencyConverterProps) {
  const { customer, createCustomer } = useFernCustomer()
  const { wallets, createWallet } = useFernWallets(customer?.id)
  const { quote, loading, error, getQuote, executeTransaction, getExchangeRate } = useFernCurrencyConversion()

  const [sourceCurrency, setSourceCurrency] = useState(defaultSourceCurrency)
  const [destinationCurrency, setDestinationCurrency] = useState(defaultDestinationCurrency)
  const [sourceAmount, setSourceAmount] = useState(defaultAmount)
  const [destinationAmount, setDestinationAmount] = useState('')
  const [sourcePaymentMethod, setSourcePaymentMethod] = useState('')
  const [destinationPaymentMethod, setDestinationPaymentMethod] = useState('')
  const [exchangeRate, setExchangeRate] = useState<string>('')
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    email: '',
    type: 'individual' as 'individual' | 'business',
    firstName: '',
    lastName: '',
    businessName: '',
  })

  // Auto-set default payment methods when currencies change
  useEffect(() => {
    const sourceMethods = PAYMENT_METHODS[sourceCurrency as keyof typeof PAYMENT_METHODS] || []
    const destMethods = PAYMENT_METHODS[destinationCurrency as keyof typeof PAYMENT_METHODS] || []
    
    if (sourceMethods.length > 0 && !sourcePaymentMethod) {
      setSourcePaymentMethod(sourceMethods[0])
    }
    if (destMethods.length > 0 && !destinationPaymentMethod) {
      setDestinationPaymentMethod(destMethods[0])
    }
  }, [sourceCurrency, destinationCurrency, sourcePaymentMethod, destinationPaymentMethod])

  // Get exchange rate when currencies change
  useEffect(() => {
    if (sourceCurrency && destinationCurrency && sourceCurrency !== destinationCurrency) {
      getExchangeRate(sourceCurrency, destinationCurrency)
        .then(({ rate }) => {
          setExchangeRate(rate)
          if (sourceAmount) {
            const destAmount = (parseFloat(sourceAmount) * parseFloat(rate)).toFixed(2)
            setDestinationAmount(destAmount)
          }
        })
        .catch(console.error)
    }
  }, [sourceCurrency, destinationCurrency, getExchangeRate])

  // Update destination amount when source amount changes
  useEffect(() => {
    if (sourceAmount && exchangeRate) {
      const destAmount = (parseFloat(sourceAmount) * parseFloat(exchangeRate)).toFixed(2)
      setDestinationAmount(destAmount)
    }
  }, [sourceAmount, exchangeRate])

  const handleCreateCustomer = async () => {
    try {
      await createCustomer(customerForm)
      setShowCustomerForm(false)
    } catch (err) {
      console.error('Failed to create customer:', err)
    }
  }

  const handleGetQuote = async () => {
    if (!customer) {
      setShowCustomerForm(true)
      return
    }

    // Find or create wallets for source and destination currencies
    let sourceWallet = wallets.find(w => w.currency === sourceCurrency)
    let destWallet = wallets.find(w => w.currency === destinationCurrency)

    try {
      if (!sourceWallet) {
        sourceWallet = await createWallet(sourceCurrency)
      }
      if (!destWallet) {
        destWallet = await createWallet(destinationCurrency)
      }

      await getQuote({
        customerId: customer.id,
        source: {
          accountId: sourceWallet.id,
          currency: sourceCurrency,
          paymentMethod: sourcePaymentMethod,
          amount: sourceAmount,
        },
        destination: {
          accountId: destWallet.id,
          currency: destinationCurrency,
          paymentMethod: destinationPaymentMethod,
        },
      })
    } catch (err) {
      console.error('Failed to get quote:', err)
    }
  }

  const handleExecuteConversion = async () => {
    if (!quote) return

    try {
      const transaction = await executeTransaction(quote.id)
      onConversionComplete?.(transaction)
    } catch (err) {
      console.error('Failed to execute conversion:', err)
    }
  }

  if (showCustomerForm) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Create Fern Account</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={customerForm.email}
              onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Account Type</label>
            <select
              value={customerForm.type}
              onChange={(e) => setCustomerForm(prev => ({ ...prev, type: e.target.value as 'individual' | 'business' }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="individual">Individual</option>
              <option value="business">Business</option>
            </select>
          </div>

          {customerForm.type === 'individual' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={customerForm.firstName}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={customerForm.lastName}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Business Name</label>
              <input
                type="text"
                value={customerForm.businessName}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, businessName: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCreateCustomer}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <button
              onClick={() => setShowCustomerForm(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Currency Converter</h3>
        <div className="text-xs text-gray-500">
          Powered by Fern
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Source Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <select
              value={sourceCurrency}
              onChange={(e) => setSourceCurrency(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SUPPORTED_CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input
              type="number"
              value={sourceAmount}
              onChange={(e) => setSourceAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Payment Method for Source */}
        <div>
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          <select
            value={sourcePaymentMethod}
            onChange={(e) => setSourcePaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(PAYMENT_METHODS[sourceCurrency as keyof typeof PAYMENT_METHODS] || []).map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        {/* Conversion Arrow */}
        <div className="flex justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 border rounded-full cursor-pointer hover:bg-gray-50"
            onClick={() => {
              // Swap currencies
              setSourceCurrency(destinationCurrency)
              setDestinationCurrency(sourceCurrency)
              setSourceAmount(destinationAmount)
              setDestinationAmount(sourceAmount)
            }}
          >
            ↕️
          </motion.div>
        </div>

        {/* Destination Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <select
              value={destinationCurrency}
              onChange={(e) => setDestinationCurrency(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SUPPORTED_CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">You'll receive</label>
            <input
              type="text"
              value={destinationAmount}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Payment Method for Destination */}
        <div>
          <label className="block text-sm font-medium mb-2">Receive via</label>
          <select
            value={destinationPaymentMethod}
            onChange={(e) => setDestinationPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(PAYMENT_METHODS[destinationCurrency as keyof typeof PAYMENT_METHODS] || []).map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        {/* Exchange Rate Display */}
        {exchangeRate && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-700">
              Exchange Rate: 1 {sourceCurrency} = {parseFloat(exchangeRate).toFixed(4)} {destinationCurrency}
            </div>
          </div>
        )}

        {/* Quote Display */}
        {quote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border rounded-lg bg-green-50 border-green-200"
          >
            <h4 className="font-medium text-green-800 mb-2">Quote Details</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>Amount: {quote.source.amount} {quote.source.currency}</div>
              <div>You'll receive: {quote.destination.amount} {quote.destination.currency}</div>
              <div>Fee: {quote.fee}</div>
              <div>Rate: {quote.exchangeRate}</div>
              <div>Expires: {new Date(quote.expiresAt).toLocaleString()}</div>
            </div>
            
            <button
              onClick={handleExecuteConversion}
              disabled={loading}
              className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Execute Conversion'}
            </button>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleGetQuote}
            disabled={loading || !sourceAmount || !customer}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Quote'}
          </button>
          
          {!customer && (
            <button
              onClick={() => setShowCustomerForm(true)}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              Sign Up
            </button>
          )}
        </div>

        {/* Customer Status */}
        {customer && (
          <div className="text-xs text-gray-500 text-center">
            Connected as: {customer.email} ({customer.status})
          </div>
        )}
      </div>
    </Card>
  )
}