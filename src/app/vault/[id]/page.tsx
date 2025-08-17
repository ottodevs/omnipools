'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import Card from '@/components/Card'
import FlowConnect from '@/components/flow-connect'
import TransactionExecutor from '@/components/transaction-executor'
import { useVaultData } from '@/hooks/use-vault-data'
import { CADENCE_TRANSACTIONS, DEMO_ORG_ADDRESS } from '@/lib/constants/vault'

export default function VaultPage() {
  const params = useParams()
  const id = params.id || '1'
  const [showMisses, setShowMisses] = useState(false)

  const { data, error, loading, refresh, flowConfig, useRealData, toggleDataSource } = useVaultData(DEMO_ORG_ADDRESS, id as string)

  const handleTransactionSuccess = (_result: any) => {
    // Refresh data after successful transaction
    setTimeout(() => {
      refresh()
    }, 2000)
  }

  const handleTransactionError = (_error: string) => {
    // Error handled by TransactionExecutor component
  }

  // Show skeleton for 300-500ms to avoid "stuck loading" when live-demoing
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
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="flex gap-2">
              <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#0b1020] text-white">
        <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
          <FlowConnect />

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-3 text-red-200">
              {error}
            </div>
          )}

          <div className="py-20 text-center">
            <p className="mb-4 text-white/60">No vault data available</p>
            <p className="mb-4 text-sm text-white/40">
              Network:
              {' '}
              {flowConfig.network}
              {' '}
              | Org:
              {' '}
              {DEMO_ORG_ADDRESS}
              {' '}
              | Vault:
              {' '}
              {id}
            </p>
            <button
              onClick={refresh}
              className={`
                rounded-xl bg-white/10 px-4 py-2 text-white
                hover:bg-white/20
              `}
            >
              Refresh data
            </button>
          </div>
        </div>
      </main>
    )
  }

  const payoutCmd = `flow transactions send ./cadence/transactions/tx_payout_split.cdc ${data.org} ${data.vaultId}`
  const statusColor = data.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'

  // Calcular misses basándose en la diferencia entre participantes y winners
  const misses: Record<string, string> = {}
  if (showMisses && data) {
    const winnerAddresses = new Set(data.winners.map(w => w.address))
    data.participants.forEach((participant) => {
      if (!winnerAddresses.has(participant.address)) {
        misses[participant.address] = '0' // No amount specified for misses
      }
    })
  }

  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <FlowConnect />

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-3 text-red-200">
            {error}
          </div>
        )}

        <div className="relative">
          <img src="/assets/omnipools_banner_inline.png" alt="OmniPools" className="w-full rounded-2xl" />
          <div className="absolute inset-0 rounded-2xl bg-black/20" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">
            {data.name}
            {' '}
            <span className="text-white/50">
              #
              {data.vaultId}
            </span>
          </h1>
          <p className="text-white/70">{data.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`
              rounded-full px-3 py-1
              ${statusColor}
            `}
            >
              {data.status}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">
              opId:
              {data.lastOperationId}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">
              totalPaid:
              {data.totalPaid}
              {' '}
              USDC
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">
              totalFunding:
              {data.totalFunding}
              {' '}
              USDC
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">
              participants:
              {data.participantCount}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">
              winners:
              {data.winnerCount}
            </span>
            <button
              onClick={refresh}
              className={`
                rounded-xl bg-white/10 px-4 py-2 text-white
                hover:bg-white/20
              `}
            >
              Refresh data
            </button>
            <button
              onClick={() => setShowMisses(!showMisses)}
              className={`
                rounded-xl bg-orange-500/20 px-4 py-2 text-orange-200
                hover:bg-orange-500/30
              `}
            >
              {showMisses ? 'Show Normal' : 'Show Misses'}
            </button>
            <button
              onClick={toggleDataSource}
              className={`
                rounded-xl px-4 py-2 text-white
                ${useRealData
      ? `
        bg-green-500/20 text-green-200
        hover:bg-green-500/30
      `
      : `
        bg-blue-500/20 text-blue-200
        hover:bg-blue-500/30
      `
    }
              `}
            >
              {useRealData ? 'Live Data' : 'Demo Data'}
            </button>
          </div>
        </div>

        <div className={`
          grid gap-6
          md:grid-cols-2
        `}
        >
          <Card title="Winners">
            <div className="space-y-2">
              {data.winners.length === 0
                ? (
                    <div className="text-white/60">No winners set</div>
                  )
                : (
                    data.winners.map((w, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                        <code className="text-white/80">{w.address}</code>
                        <div className="font-medium">
                          {w.amount}
                          {' '}
                          USDC
                        </div>
                      </div>
                    ))
                  )}
            </div>
          </Card>

          <Card title="Misses (weak guarantees)">
            {Object.keys(misses).length === 0
              ? (
                  <div className="text-white/60">None</div>
                )
              : (
                  <div className="space-y-2">
                    {Object.entries(misses).map(([addr, amt]) => (
                      <div key={addr} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                        <code className="text-white/80">{addr}</code>
                        <div className="font-medium">
                          {amt}
                          {' '}
                          USDC (skipped)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
          </Card>

          <Card title="Participants">
            <div className="space-y-2">
              {data.participants.length === 0
                ? (
                    <div className="text-white/60">No participants</div>
                  )
                : (
                    data.participants.map((p, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                        <code className="text-white/80">{p.address}</code>
                        <div className="text-sm text-white/60">
                          ID:
                          {p.id}
                        </div>
                      </div>
                    ))
                  )}
            </div>
          </Card>

          <Card title="Receipts">
            <div className="space-y-2">
              {data.receipts.length === 0
                ? (
                    <div className="text-white/60">No receipts</div>
                  )
                : (
                    data.receipts.map((receipt, i) => (
                      <div key={i} className="rounded-xl bg-white/5 px-4 py-3">
                        <div className="text-sm text-white/80">
                          <strong>Amount:</strong>
                          {' '}
                          {receipt.amount || 'N/A'}
                        </div>
                        <div className="text-sm text-white/60">
                          <strong>Vendor:</strong>
                          {' '}
                          {receipt.vendor || 'N/A'}
                        </div>
                        {receipt.uri && (
                          <div className="text-sm text-white/60">
                            <strong>URI:</strong>
                            {' '}
                            {receipt.uri}
                          </div>
                        )}
                      </div>
                    ))
                  )}
            </div>
          </Card>

          <Card title="Execute Payout Split">
            <TransactionExecutor
              title="Payout Split"
              cadence={CADENCE_TRANSACTIONS.payoutSplit}
              args={[
                { type: 'Address', value: data.org },
                { type: 'UInt64', value: data.vaultId.toString() },
              ]}
              buttonText="Execute Payout"
              onSuccess={handleTransactionSuccess}
              onError={handleTransactionError}
            />
          </Card>

          <Card title="CLI Command (for reference)">
            <p className="mb-3 text-white/70">Alternative: Use the CLI to execute the Flow Action:</p>
            <pre className="overflow-auto rounded-xl bg-black/40 p-4 text-sm">{payoutCmd}</pre>
            <p className="mt-3 text-white/60">After running, refresh this page to see updated data from the blockchain.</p>
          </Card>

          <Card title="Proof (summary)">
            <pre className="overflow-auto rounded-xl bg-black/40 p-4 text-xs">
              {JSON.stringify({
                status: data.status,
                lastOperationId: data.lastOperationId,
                totalPaid: data.totalPaid,
                totalFunding: data.totalFunding,
                participantCount: data.participantCount,
                winnerCount: data.winnerCount,
                network: flowConfig.network,
                org: data.org,
                vaultId: data.vaultId,
              }, null, 2)}
            </pre>
          </Card>
        </div>
      </div>
    </main>
  )
}
