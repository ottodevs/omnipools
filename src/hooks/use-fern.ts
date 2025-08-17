/**
 * React hooks for Fern API integration
 */

import { useState, useEffect, useCallback } from 'react'
import { getFernClient, FernCustomer, FernWallet, FernQuote, FernTransaction } from '@/lib/fern/client'

export function useFernCustomer() {
  const [customer, setCustomer] = useState<FernCustomer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCustomer = useCallback(async (data: {
    email: string
    type: 'individual' | 'business'
    firstName?: string
    lastName?: string
    businessName?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const fernClient = getFernClient()
      const newCustomer = await fernClient.createCustomer(data)
      setCustomer(newCustomer)
      
      // Store customer ID in localStorage for persistence
      localStorage.setItem('fern-customer-id', newCustomer.id)
      
      return newCustomer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCustomer = useCallback(async (customerId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const fernClient = getFernClient()
      const customerData = await fernClient.getCustomer(customerId)
      setCustomer(customerData)
      return customerData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load customer'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-load customer from localStorage on mount
  useEffect(() => {
    const savedCustomerId = localStorage.getItem('fern-customer-id')
    if (savedCustomerId && !customer) {
      loadCustomer(savedCustomerId).catch(console.error)
    }
  }, [customer, loadCustomer])

  return {
    customer,
    loading,
    error,
    createCustomer,
    loadCustomer,
  }
}

export function useFernWallets(customerId?: string) {
  const [wallets, setWallets] = useState<FernWallet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createWallet = useCallback(async (currency: string) => {
    if (!customerId) throw new Error('Customer ID required')
    
    setLoading(true)
    setError(null)
    
    try {
      const fernClient = getFernClient()
      const newWallet = await fernClient.createWallet(customerId, currency)
      setWallets(prev => [...prev, newWallet])
      return newWallet
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create wallet'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId])

  const loadWallets = useCallback(async () => {
    if (!customerId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const fernClient = getFernClient()
      const walletsData = await fernClient.getCustomerWallets(customerId)
      setWallets(walletsData)
      return walletsData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load wallets'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    if (customerId) {
      loadWallets().catch(console.error)
    }
  }, [customerId, loadWallets])

  return {
    wallets,
    loading,
    error,
    createWallet,
    loadWallets,
  }
}

export function useFernCurrencyConversion() {
  const [quote, setQuote] = useState<FernQuote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getQuote = useCallback(async (data: {
    customerId: string
    source: {
      accountId: string
      currency: string
      paymentMethod: string
      amount: string
    }
    destination: {
      accountId: string
      currency: string
      paymentMethod: string
    }
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const fernClient = getFernClient()
      const quoteData = await fernClient.getQuote(data)
      setQuote(quoteData)
      return quoteData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get quote'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const executeTransaction = useCallback(async (quoteId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const fernClient = getFernClient()
      const transaction = await fernClient.createTransaction(quoteId)
      return transaction
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute transaction'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getExchangeRate = useCallback(async (
    sourceCurrency: string,
    destinationCurrency: string
  ) => {
    try {
      const fernClient = getFernClient()
      return await fernClient.getExchangeRates(sourceCurrency, destinationCurrency)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get exchange rate'
      setError(errorMessage)
      throw err
    }
  }, [])

  return {
    quote,
    loading,
    error,
    getQuote,
    executeTransaction,
    getExchangeRate,
  }
}

export function useFernTransactions(customerId?: string) {
  const [transactions, setTransactions] = useState<FernTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTransactions = useCallback(async () => {
    if (!customerId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const fernClient = getFernClient()
      const transactionsData = await fernClient.getCustomerTransactions(customerId)
      setTransactions(transactionsData)
      return transactionsData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId])

  const getTransaction = useCallback(async (transactionId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const fernClient = getFernClient()
      const transaction = await fernClient.getTransaction(transactionId)
      return transaction
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get transaction'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (customerId) {
      loadTransactions().catch(console.error)
    }
  }, [customerId, loadTransactions])

  return {
    transactions,
    loading,
    error,
    loadTransactions,
    getTransaction,
  }
}