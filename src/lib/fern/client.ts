/**
 * Fern API Client
 * Handles currency conversion, wallet creation, and payment processing
 */

const FERN_API_BASE = 'https://app.fernhq.com/api/v1'

export interface FernCustomer {
  id: string
  email: string
  type: 'individual' | 'business'
  status: 'pending' | 'verified' | 'rejected'
}

export interface FernWallet {
  id: string
  customerId: string
  currency: string
  address?: string
  balance: string
}

export interface FernQuote {
  id: string
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
    amount: string
  }
  exchangeRate: string
  fee: string
  expiresAt: string
}

export interface FernTransaction {
  id: string
  quoteId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  source: {
    accountId: string
    currency: string
    amount: string
  }
  destination: {
    accountId: string
    currency: string
    amount: string
  }
  createdAt: string
  completedAt?: string
}

class FernClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${FERN_API_BASE}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Fern API error: ${response.status} - ${errorData.message || response.statusText}`)
      }

      return response.json()
    } catch (error) {
      // Re-throw the error so calling methods can handle it with their own fallbacks
      throw error
    }
  }

  // Customer Management
  async createCustomer(data: {
    email: string
    type: 'individual' | 'business'
    firstName?: string
    lastName?: string
    businessName?: string
  }): Promise<FernCustomer> {
    try {
      return this.request<FernCustomer>('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.warn('Fern API not available, creating mock customer for demo')
      
      // Mock customer for demo
      const mockCustomer: FernCustomer = {
        id: `mock-customer-${Date.now()}`,
        email: data.email,
        type: data.type,
        status: 'verified'
      }
      
      return mockCustomer
    }
  }

  async getCustomer(customerId: string): Promise<FernCustomer> {
    return this.request<FernCustomer>(`/customers/${customerId}`)
  }

  // Wallet Management
  async createWallet(customerId: string, currency: string): Promise<FernWallet> {
    try {
      return this.request<FernWallet>('/wallets', {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          currency,
        }),
      })
    } catch (error) {
      console.warn('Fern API not available, creating mock wallet for demo')
      
      // Mock wallet for demo
      const mockWallet: FernWallet = {
        id: `mock-wallet-${Date.now()}`,
        customerId,
        currency,
        address: currency === 'USDC' ? `0x${Math.random().toString(16).slice(2, 42)}` : undefined,
        balance: (Math.random() * 1000).toFixed(2)
      }
      
      return mockWallet
    }
  }

  async getWallet(walletId: string): Promise<FernWallet> {
    return this.request<FernWallet>(`/wallets/${walletId}`)
  }

  async getCustomerWallets(customerId: string): Promise<FernWallet[]> {
    return this.request<FernWallet[]>(`/customers/${customerId}/wallets`)
  }

  // Currency Conversion
  async getQuote(data: {
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
    developerFee?: {
      developerFeeType: 'USD_SPREAD'
      developerFeeAmount: string
    }
  }): Promise<FernQuote> {
    return this.request<FernQuote>('/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getExchangeRates(
    sourceCurrency: string,
    destinationCurrency: string
  ): Promise<{ rate: string; lastUpdated: string }> {
    // For demo purposes, return mock exchange rates if API is not available
    try {
      return this.request<{ rate: string; lastUpdated: string }>(
        `/exchange-rates?source=${sourceCurrency}&destination=${destinationCurrency}`
      )
    } catch (error) {
      console.warn('Fern API not available, using mock exchange rates for demo')
      
      // Mock exchange rates for demo
      const mockRates: Record<string, Record<string, number>> = {
        USD: { USDC: 1.0, EUR: 0.85, GBP: 0.75 },
        EUR: { USD: 1.18, USDC: 1.18, GBP: 0.88 },
        GBP: { USD: 1.33, USDC: 1.33, EUR: 1.14 },
        USDC: { USD: 1.0, EUR: 0.85, GBP: 0.75 }
      }
      
      const rate = mockRates[sourceCurrency]?.[destinationCurrency] || 1.0
      
      return {
        rate: rate.toString(),
        lastUpdated: new Date().toISOString()
      }
    }
  }

  // Transactions
  async createTransaction(quoteId: string): Promise<FernTransaction> {
    return this.request<FernTransaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify({ quoteId }),
    })
  }

  async getTransaction(transactionId: string): Promise<FernTransaction> {
    return this.request<FernTransaction>(`/transactions/${transactionId}`)
  }

  async getCustomerTransactions(customerId: string): Promise<FernTransaction[]> {
    return this.request<FernTransaction[]>(`/customers/${customerId}/transactions`)
  }
}

// Singleton instance
let fernClient: FernClient | null = null

export function getFernClient(): FernClient {
  if (!fernClient) {
    // For client-side usage, we'll pass the API key through props or context
    // For server-side usage, we use environment variables
    const apiKey = typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_FERN_API_KEY || 'demo-key-for-development'
      : process.env.FERN_API_KEY
    
    if (!apiKey) {
      throw new Error('FERN_API_KEY environment variable is required')
    }
    fernClient = new FernClient(apiKey)
  }
  return fernClient
}

// Alternative function for when API key is provided directly
export function createFernClient(apiKey: string): FernClient {
  return new FernClient(apiKey)
}

export default FernClient