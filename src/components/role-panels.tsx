'use client'

import { useState, useEffect } from 'react'
import { useRole } from '@/lib/contexts/role-context'
import Card from '@/components/Card'
import CopyButton from '@/components/ui/copy-button'

interface RolePanelsProps {
  vaultId: string
  vaultData: any
  onStatusUpdate: (status: string, operationId: number, totalPaid: number) => void
}

export default function RolePanels({ vaultId, vaultData, onStatusUpdate }: RolePanelsProps) {
  const { currentRole } = useRole()
  const [isReady, setIsReady] = useState(false)
  const [lastOperationId, setLastOperationId] = useState(vaultData.lastOperationId || 0)

  // Load ready state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`vault-${vaultId}-ready`)
      setIsReady(saved === 'true')
    }
  }, [vaultId])

  const handlePlanPayout = () => {
    onStatusUpdate('PayoutPlanned', lastOperationId, vaultData.totalPaid)
  }

  const handleRunPayoutMock = () => {
    const newOperationId = lastOperationId + 1
    const totalPaid = vaultData.winners.reduce((sum: number, winner: any) => sum + parseFloat(winner.amount), 0)
    
    setLastOperationId(newOperationId)
    onStatusUpdate('Paid', newOperationId, totalPaid)
  }

  const handleToggleReady = () => {
    const newReady = !isReady
    setIsReady(newReady)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`vault-${vaultId}-ready`, newReady.toString())
    }
  }

  const cctpCommand = `bun ts-node scripts/cctp_transfer.ts --from=BaseSepolia --to=FlowTestnet --amount=5000 --token=USDC --memo="vault:${vaultId}"`
  const layerzeroCommand = `node scripts/layerzero_mirror.js --vault ${vaultId} --op ${lastOperationId} --total ${vaultData.totalPaid}`

  if (currentRole === 'Organizer') {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Plan Payout">
          <div className="space-y-4">
            <p className="text-white/70">
              Plan the payout for vault #{vaultId}. This will set the status to "PayoutPlanned".
            </p>
            <button
              onClick={handlePlanPayout}
              className="w-full rounded-xl bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Plan Payout
            </button>
          </div>
        </Card>

        <Card title="Run Payout (Mock)">
          <div className="space-y-4">
            <p className="text-white/70">
              Execute the payout simulation. This will update status to "Paid" and increment operation ID.
            </p>
            <div className="space-y-2 text-sm text-white/60">
              <div>Current opId: {lastOperationId}</div>
              <div>Winners: {vaultData.winnerCount}</div>
              <div>Total to pay: {vaultData.winners.reduce((sum: number, winner: any) => sum + parseFloat(winner.amount), 0)} USDC</div>
            </div>
            <button
              onClick={handleRunPayoutMock}
              className="w-full rounded-xl bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              Run Payout (Mock)
            </button>
          </div>
        </Card>

        <Card title="Real Flow CLI Command">
          <div className="space-y-3">
            <p className="text-white/70">Execute the actual payout on Flow:</p>
            <div className="relative">
              <pre className="overflow-auto rounded-xl bg-black/40 p-4 text-sm">
                {`flow transactions send ./cadence/transactions/tx_payout_split.cdc ${vaultData.org} ${vaultId}`}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={`flow transactions send ./cadence/transactions/tx_payout_split.cdc ${vaultData.org} ${vaultId}`} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (currentRole === 'Sponsor') {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Circle CCTP Treasury Top-up">
          <div className="space-y-4">
            <p className="text-white/70">
              Top up the treasury using Circle's Cross-Chain Transfer Protocol (CCTP).
            </p>
            <div className="relative">
              <pre className="overflow-auto rounded-xl bg-black/40 p-4 text-sm">
                {cctpCommand}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={cctpCommand} />
              </div>
            </div>
            <div className="text-sm text-white/60">
              <div>• Transfers USDC from Base Sepolia to Flow Testnet</div>
              <div>• Amount: 5000 USDC</div>
              <div>• Memo includes vault ID for tracking</div>
            </div>
          </div>
        </Card>

        <Card title="LayerZero Mirror Receipt">
          <div className="space-y-4">
            <p className="text-white/70">
              Mirror the payout receipt across chains using LayerZero.
            </p>
            <div className="relative">
              <pre className="overflow-auto rounded-xl bg-black/40 p-4 text-sm">
                {layerzeroCommand}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={layerzeroCommand} />
              </div>
            </div>
            <div className="text-sm text-white/60">
              <div>• Mirrors payout receipt to other chains</div>
              <div>• Includes vault ID, operation ID, and total amount</div>
              <div>• Enables cross-chain audit trail</div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (currentRole === 'Participant') {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Register / Link USDC Receiver">
          <div className="space-y-4">
            <p className="text-white/70">
              Register your USDC receiver address for payouts.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleReady}
                  className={`rounded-xl px-4 py-2 text-white transition-colors ${
                    isReady
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isReady ? 'Unregister' : 'Register / Link Receiver'}
                </button>
                {isReady && (
                  <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-200">
                    ✓ Ready
                  </span>
                )}
              </div>
              {isReady && (
                <div className="rounded-xl bg-green-500/10 p-3 text-sm text-green-200">
                  <div>✅ USDC receiver linked successfully</div>
                  <div>📍 Address: 0x1234...5678 (mock)</div>
                  <div>🔗 Chain: Flow Testnet</div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card title="Payout Status">
          <div className="space-y-3">
            <div className="text-sm text-white/60">
              <div>Vault Status: <span className="text-white">{vaultData.status}</span></div>
              <div>Operation ID: <span className="text-white">{vaultData.lastOperationId}</span></div>
              <div>Total Paid: <span className="text-white">{vaultData.totalPaid} USDC</span></div>
            </div>
            {vaultData.status === 'Paid' && (
              <div className="rounded-xl bg-green-500/10 p-3 text-sm text-green-200">
                🎉 Payout completed! Check your wallet for USDC.
              </div>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return null
} 