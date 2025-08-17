'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/Card'
import FlowConnect from '@/components/flow-connect'

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
  const [vault1, setVault1] = useState<Vault | null>(null)
  const [vault2, setVault2] = useState<Vault | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVaults = async () => {
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
      }
    }

    loadVaults()
  }, [])

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
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <FlowConnect />

        <div className="relative">
          <img src="/assets/omnipools_banner_inline.png" alt="OmniPools" className="w-full rounded-2xl" />
          <div className="absolute inset-0 rounded-2xl bg-black/20" />
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Pools</h1>
          <div className="flex gap-2">
            <Link href="/" className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">
              Home
            </Link>
            <Link href="/create" className="rounded-xl bg-blue-500 px-4 py-2 hover:bg-blue-600">
              Create New
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vault1 && (
            <Card title={`Vault #${vault1.vaultId}`}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{vault1.name}</h3>
                  <p className="text-white/70 mb-3">{vault1.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm ${getStatusColor(vault1.status)}`}>
                    {vault1.status}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
                    {vault1.totalPaid} USDC
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
                    {vault1.winners.length} winners
                  </span>
                </div>

                <Link
                  href={`/vault/${vault1.vaultId}`}
                  className="block w-full rounded-xl bg-white/10 px-4 py-3 text-center hover:bg-white/20 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </Card>
          )}

          {vault2 && (
            <Card title={`Vault #${vault2.vaultId} (Draft)`}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{vault2.name}</h3>
                  <p className="text-white/70 mb-3">{vault2.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm ${getStatusColor(vault2.status)}`}>
                    {vault2.status}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
                    {vault2.totalPaid} USDC
                  </span>
                  <span className="rounded-full bg-orange-500/20 px-3 py-1 text-sm text-orange-200">
                    Draft
                  </span>
                </div>

                <Link
                  href={`/vault/${vault2.vaultId}`}
                  className="block w-full rounded-xl bg-white/10 px-4 py-3 text-center hover:bg-white/20 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </Card>
          )}

          {!vault1 && !vault2 && (
            <div className="col-span-full text-center py-12">
              <p className="text-white/60 mb-4">No vaults found</p>
              <Link
                href="/create"
                className="rounded-xl bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600"
              >
                Create Your First Vault
              </Link>
            </div>
          )}
        </div>

        {!vault2 && (
          <Card title="Create New Vault">
            <div className="text-center py-6">
              <p className="text-white/70 mb-4">
                Use AI to generate a new vault recipe and save it as a draft
              </p>
              <Link
                href="/create"
                className="rounded-xl bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600"
              >
                Start Creating
              </Link>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
} 