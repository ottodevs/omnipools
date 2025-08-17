'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '@/components/Card'
import FlowConnect from '@/components/flow-connect'
import FernDemo from '@/components/fern-demo'
import { useRole } from '@/lib/contexts/role-context'

interface Vault {
  vaultId: number
  org: string
  name: string
  description: string
  status: string
  lastOperationId: number
  totalPaid: string
  winners: Array<{ address: string; amount: string }>
  misses: Record<string, string>
}

export default function PoolsPage() {
  const { role } = useRole()
  const [vault1, setVault1] = useState<Vault | null>(null)
  const [vault2, setVault2] = useState<Vault | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadVaults = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    
    try {
      // Load Vault #1 from public data
      const response = await fetch('/data/vault-1.json')
      if (response.ok) {
        const vault1Data = await response.json()
        setVault1(vault1Data)
      }

      // Load Vault #2 from localStorage
      const vault2Data = localStorage.getItem('op_vault_2')
      if (vault2Data) {
        setVault2(JSON.parse(vault2Data))
      }
    } catch (error) {
      console.error('Error loading vaults:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadVaults()
  }, [])

  const handleRefresh = () => {
    loadVaults(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500/20 text-emerald-200'
      case 'PayoutPlanned':
        return 'bg-amber-500/20 text-amber-200'
      default:
        return 'bg-white/10 text-white/80'
    }
  }

  const VaultCard = ({ vault, index }: { vault: Vault; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card title={`Vault #${vault.vaultId}`}>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-200 transition-colors">
              {vault.name}
            </h3>
            <p className="text-white/70 mb-3 line-clamp-2">{vault.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-sm ${getStatusColor(vault.status)}`}>
              {vault.status}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
              {vault.totalPaid} USDC
            </span>
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-200">
              {vault.winners.length} winners
            </span>
            {Object.keys(vault.misses).length > 0 && (
              <span className="rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-200">
                {Object.keys(vault.misses).length} misses
              </span>
            )}
          </div>

          {/* Role-specific info */}
          {role && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-white/60 mb-1">As {role}:</div>
              {role === 'Organizer' && (
                <div className="text-sm text-white/80">
                  Manage winners and execute payouts
                </div>
              )}
              {role === 'Participant' && (
                <div className="text-sm text-white/80">
                  Link receiver to participate in payouts
                </div>
              )}
              {role === 'Sponsor' && (
                <div className="text-sm text-white/80">
                  Track funding impact and analytics
                </div>
              )}
            </div>
          )}

          <Link
            href={`/vault/${vault.vaultId}`}
            className="block w-full rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 px-4 py-3 text-center text-blue-200 hover:from-blue-500/30 hover:to-purple-500/30 hover:border-blue-400/50 transition-all group-hover:scale-105"
          >
            View Details →
          </Link>
        </div>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b1020] text-white">
        <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
          <div className="relative">
            <div className="h-32 w-full animate-pulse rounded-2xl bg-white/10" />
            <div className="absolute inset-0 rounded-2xl bg-black/20" />
          </div>
          <div className="space-y-4">
            <div className="h-8 w-1/2 animate-pulse rounded bg-white/10" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-48 animate-pulse rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 py-6 sm:py-10">
        <FlowConnect />

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <img src="/assets/omnipools_banner_inline.png" alt="TrustFlow" className="w-full rounded-2xl" />
          <div className="absolute inset-0 rounded-2xl bg-black/20" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Your Pools</h1>
            {role && (
              <p className="text-white/60 text-sm mt-1">
                Viewing as: <span className="text-blue-200 font-medium">{role}</span>
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`rounded-xl px-4 py-2 text-sm transition-all ${
                refreshing
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {refreshing ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-white/40 border-t-transparent rounded-full animate-spin"></div>
                  Refreshing
                </span>
              ) : (
                '↻ Refresh'
              )}
            </button>
            <Link 
              href="/" 
              className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/create" 
              className="rounded-xl bg-blue-500 px-4 py-2 text-sm hover:bg-blue-600 transition-colors"
            >
              Create New
            </Link>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={`${vault1?.vaultId}-${vault2?.vaultId}`}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {vault1 && <VaultCard vault={vault1} index={0} />}
            {vault2 && <VaultCard vault={vault2} index={1} />}
            
            {!vault1 && !vault2 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full"
              >
                <Card title="No Pools Yet">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-6">🏊‍♂️</div>
                    <h3 className="text-xl font-semibold mb-2">Dive into TrustFlow</h3>
                    <p className="text-white/60 mb-6 max-w-md mx-auto">
                      Create your first pool with AI assistance and start managing payouts with audit-ready transparency
                    </p>
                    <Link
                      href="/create"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-medium text-white hover:from-blue-600 hover:to-purple-600 transition-all hover:scale-105"
                    >
                      ✨ Create Your First Pool
                    </Link>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Quick actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <Link
            href="/create"
            className="group p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:from-blue-500/20 hover:to-purple-500/20 hover:border-blue-400/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">🚀</div>
              <div>
                <h3 className="font-medium group-hover:text-blue-200 transition-colors">Create Pool</h3>
                <p className="text-sm text-white/60">AI-powered setup</p>
              </div>
            </div>
          </Link>
          
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📊</div>
              <div>
                <h3 className="font-medium text-white/60">Analytics</h3>
                <p className="text-sm text-white/40">Coming soon</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🔗</div>
              <div>
                <h3 className="font-medium text-white/60">Cross-chain</h3>
                <p className="text-sm text-white/40">Roadmap</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fern Integration Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FernDemo />
        </motion.div>
      </div>
    </main>
  )
} 