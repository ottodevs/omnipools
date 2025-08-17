import { useState, useEffect, useCallback } from 'react'
import { useNetwork } from '@/lib/contexts/network-context'
import { CADENCE_SCRIPTS } from '@/lib/flow/scripts'
import * as fcl from '@onflow/fcl'

export type Winner = { 
  address: string; 
  amount: string 
}

export type Participant = {
  id: string
  address: string
  meta: Record<string, string>
  addedAt: string
}

export type VaultData = {
  vaultId: number
  org: string
  name: string
  description: string
  status: string
  lastOperationId: number
  totalPaid: string
  totalFunding: string
  participantCount: number
  winnerCount: number
  createdAt: string
  bannerCID?: string
  logoCID?: string
  externalURL?: string
  winners: Winner[]
  participants: Participant[]
  receipts: Record<string, string>[]
  misses: Record<string, string>
}

export const useVaultData = (orgAddress: string, vaultId: string) => {
  const { networkConfig } = useNetwork()
  const [data, setData] = useState<VaultData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [useRealData, setUseRealData] = useState(false) // Toggle entre demo y datos reales

  const fetchVaultData = useCallback(async () => {
    if (!orgAddress || !vaultId) {
      setError('Missing org address or vault ID')
      setLoading(false)
      return
    }

    try {
      setError(null)
      setLoading(true)

      if (useRealData) {
        // Intentar obtener datos reales de la blockchain
        try {
          const vaultResult = await fcl.query({
            cadence: CADENCE_SCRIPTS.getVault,
            args: (arg: any, t: any) => [
              arg(orgAddress, t.Address),
              arg(vaultId, t.UInt64)
            ]
          })

          if (vaultResult) {
            const vaultData = vaultResult
            
            const completeData: VaultData = {
              vaultId: parseInt(vaultId),
              org: orgAddress,
              name: vaultData?.name || 'Live Vault',
              description: vaultData?.description || 'Real blockchain data',
              status: vaultData?.status || 'Unknown',
              lastOperationId: parseInt(vaultData?.lastOperationId?.toString() || '0'),
              totalPaid: vaultData?.totalWinners?.toString() || '0',
              totalFunding: vaultData?.totalFunding?.toString() || '0',
              participantCount: parseInt(vaultData?.participantCount?.toString() || '0'),
              winnerCount: parseInt(vaultData?.winnerCount?.toString() || '0'),
              createdAt: vaultData?.createdAt?.toString() || '',
              bannerCID: vaultData?.bannerCID,
              logoCID: vaultData?.logoCID,
              externalURL: vaultData?.externalURL,
              winners: [],
              participants: [],
              receipts: [],
              misses: {}
            }
            
            setData(completeData)
            return
          }
        } catch (blockchainError) {
          console.warn('Blockchain query failed, falling back to demo data:', blockchainError)
          setError('Failed to fetch from blockchain, showing demo data')
        }
      }

      // Demo data (fallback or demo mode)
      const completeData: VaultData = {
        vaultId: parseInt(vaultId),
        org: orgAddress,
        name: `Demo Vault ${vaultId}`,
        description: 'A demonstration vault showing Flow blockchain integration (Demo Mode)',
        status: 'Active',
        lastOperationId: 42,
        totalPaid: '1000.0',
        totalFunding: '5000.0',
        participantCount: 3,
        winnerCount: 2,
        createdAt: Date.now().toString(),
        bannerCID: '',
        logoCID: '',
        externalURL: '',
        winners: [
          { address: '0x1234567890abcdef', amount: '500.0' },
          { address: '0xfedcba0987654321', amount: '500.0' }
        ],
        participants: [
          { id: '1', address: '0x1234567890abcdef', meta: {}, addedAt: Date.now().toString() },
          { id: '2', address: '0xfedcba0987654321', meta: {}, addedAt: Date.now().toString() },
          { id: '3', address: '0x1111222233334444', meta: {}, addedAt: Date.now().toString() }
        ],
        receipts: [
          { amount: '1000.0', vendor: 'Demo Vendor', uri: 'https://example.com/receipt' }
        ],
        misses: {}
      }

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))
      setData(completeData)
    } catch (err) {
      console.error('Error fetching vault data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch vault data')
    } finally {
      setLoading(false)
    }
  }, [orgAddress, vaultId, networkConfig])

  useEffect(() => {
    fetchVaultData()
  }, [fetchVaultData])

  const refresh = useCallback(() => {
    fetchVaultData()
  }, [fetchVaultData])

  const toggleDataSource = useCallback(() => {
    setUseRealData(!useRealData)
    fetchVaultData()
  }, [useRealData, fetchVaultData])

  return {
    data,
    error,
    loading,
    refresh,
    flowConfig: networkConfig,
    useRealData,
    toggleDataSource
  }
} 