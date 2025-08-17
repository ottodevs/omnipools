'use client'

import { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/Card'
import FlowConnect from '@/components/flow-connect'
import { DEMO_ORG_ADDRESS } from '@/lib/constants/vault'

interface Recipe {
  name: string
  template: 'Bounty' | 'Event' | 'Staking House'
  widgets: Array<'kycFern' | 'cctpCircle' | 'lzMirror' | 'tickets' | 'vrf' | 'farcaster'>
  token: 'USDC'
  chain: 'Flow'
  durationDays?: number
  targetAmount?: number
}

interface Vault2 {
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

export default function CreatePage() {
  const [prompt, setPrompt] = useState('')
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const generateRecipe = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/ai/recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate recipe')
      }

      const data = await response.json()
      setRecipe(data)
      setSaved(false)
    } catch (error) {
      console.error('Error generating recipe:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveAsVault2 = () => {
    if (!recipe) return

    const description = `${recipe.template} template with ${recipe.widgets.join(', ')} widgets`
    
    const vault2: Vault2 = {
      vaultId: 2,
      org: DEMO_ORG_ADDRESS,
      name: recipe.name,
      description,
      status: 'PayoutPlanned',
      lastOperationId: 0,
      totalPaid: '0.00',
      winners: [],
      misses: {},
    }

    localStorage.setItem('op_vault_2', JSON.stringify(vault2))
    setSaved(true)
  }

  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
        <FlowConnect />

        <div className="relative">
          <img src="/assets/omnipools_banner_inline.png" alt="OmniPools" className="w-full rounded-2xl" />
          <div className="absolute inset-0 rounded-2xl bg-black/20" />
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Create New Vault</h1>
          <div className="flex gap-2">
            <Link href="/" className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">
              Home
            </Link>
            <Link href="/pools" className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">
              Pools
            </Link>
          </div>
        </div>

        <Card title="AI Recipe Generator">
          <div className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-white/70 mb-2">
                Describe your vault
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A hackathon bounty for the best DeFi protocol with KYC verification and cross-chain transfers..."
                className="w-full h-32 rounded-xl bg-white/5 border border-white/10 p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            
            <button
              onClick={generateRecipe}
              disabled={loading || !prompt.trim()}
              className={`
                w-full rounded-xl px-6 py-3 font-medium
                ${loading || !prompt.trim()
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }
              `}
            >
              {loading ? 'Generating...' : 'Generate Recipe'}
            </button>
          </div>
        </Card>

        {recipe && (
          <Card title="Generated Recipe">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{recipe.name}</h3>
                  <p className="text-white/70 mb-3">
                    {recipe.template} template with {recipe.widgets.join(', ')} widgets
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Token:</span>
                      <span className="rounded-full bg-green-500/20 px-2 py-1 text-sm text-green-200">
                        {recipe.token}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Chain:</span>
                      <span className="rounded-full bg-blue-500/20 px-2 py-1 text-sm text-blue-200">
                        {recipe.chain}
                      </span>
                    </div>
                    {recipe.durationDays && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">Duration:</span>
                        <span className="text-white/80">{recipe.durationDays} days</span>
                      </div>
                    )}
                    {recipe.targetAmount && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">Target Amount:</span>
                        <span className="text-white/80">{recipe.targetAmount} USDC</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Widgets</h4>
                  <div className="flex flex-wrap gap-2">
                    {recipe.widgets.map((widget) => (
                      <span
                        key={widget}
                        className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80"
                      >
                        {widget}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveAsVault2}
                  disabled={saved}
                  className={`
                    rounded-xl px-6 py-2 font-medium
                    ${saved
                      ? 'bg-green-500/20 text-green-200 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                    }
                  `}
                >
                  {saved ? 'Saved as Vault #2' : 'Save as Vault #2 (mock)'}
                </button>
                
                {saved && (
                  <Link
                    href="/pools"
                    className="rounded-xl bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600"
                  >
                    View in Pools
                  </Link>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
} 