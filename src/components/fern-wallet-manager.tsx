/**
 * Fern Wallet Manager Component
 * Manages Fern wallets and displays balances
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Card from './Card'
import { useFernCustomer, useFernWallets, useFernTransactions } from '@/hooks/use-fern'

interface WalletManagerProps {
  onWalletSelect?: (wallet: any) => void
  showTransactions?: boolean
}

const CURRENCY_ICONS: Record<string, string> = {
  USD: '💵',
  EUR: '💶',
  GBP: '💷',
  USDC: '🪙',
  USDT: '🟢',
  ETH: '⟠',
}

export default function FernWalletManager({
  onWalletSelect,
  showTransactions = true,
}: WalletManagerProps) {
  const { customer } = useFernCustomer()
  const { wallets, loading: walletsLoading, createWallet } = useFernWallets(customer?.id)
  const { transactions, loading: transactionsLoading } = useFernTransactions(customer?.id)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [showCreateWallet, setShowCreateWallet] = useState(false)
  const [newWalletCurrency, setNewWalletCurrency] = useState('USDC')

  const handleCreateWallet = async () => {
    try {
      const wallet = await createWallet(newWalletCurrency)
      setShowCreateWallet(false)
      setNewWalletCurrency('USDC')
    } catch (err) {
      console.error('Failed to create wallet:', err)
    }
  }

  const handleWalletClick = (wallet: any) => {
    setSelectedWallet(wallet.id)
    onWalletSelect?.(wallet)
  }

  if (!customer) {
    return (
      <Card className="p-6 text-center">
        <div className="text-gray-500">
          <div className="text-2xl mb-2">🔒</div>
          <div>Connect to Fern to manage wallets</div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Wallets Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Fern Wallets</h3>
          <button
            onClick={() => setShowCreateWallet(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Wallet
          </button>
        </div>

        {walletsLoading ? (
          <div className="text-center py-4 text-gray-500">Loading wallets...</div>
        ) : wallets.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No wallets found. Create your first wallet to get started.
          </div>
        ) : (
          <div className="grid gap-3">
            {wallets.map((wallet) => (
              <motion.div
                key={wallet.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleWalletClick(wallet)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedWallet === wallet.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {CURRENCY_ICONS[wallet.currency] || '💰'}
                    </div>
                    <div>
                      <div className="font-medium">{wallet.currency}</div>
                      {wallet.address && (
                        <div className="text-xs text-gray-500 font-mono">
                          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {parseFloat(wallet.balance).toLocaleString()} {wallet.currency}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Wallet Modal */}
        {showCreateWallet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
            >
              <h4 className="text-lg font-semibold mb-4">Create New Wallet</h4>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select
                  value={newWalletCurrency}
                  onChange={(e) => setNewWalletCurrency(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USDC">USDC - USD Coin</option>
                  <option value="USDT">USDT - Tether</option>
                  <option value="ETH">ETH - Ethereum</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateWallet}
                  disabled={walletsLoading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {walletsLoading ? 'Creating...' : 'Create Wallet'}
                </button>
                <button
                  onClick={() => setShowCreateWallet(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </Card>

      {/* Transactions Section */}
      {showTransactions && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          
          {transactionsLoading ? (
            <div className="text-center py-4 text-gray-500">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No transactions yet. Start by converting some currency!
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-3 border rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {transaction.source.amount} {transaction.source.currency} → {transaction.destination.amount} {transaction.destination.currency}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}