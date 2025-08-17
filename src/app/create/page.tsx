'use client'

import { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/Card'
import FlowConnect from '@/components/flow-connect'
import { DEMO_ORG_ADDRESS } from '@/lib/constants/vault'
import { useNetwork } from '@/lib/contexts/network-context'
import { processImageFile, validateImageFile, ImageMetadata } from '@/lib/utils/image-utils'
import { createVaultTransaction, waitForTransaction } from '@/lib/flow/transactions'
import { useFlowTransactions } from '@/hooks/use-flow-transactions'
import FernCurrencyConverter from '@/components/fern-currency-converter'
import { motion } from 'framer-motion'

interface Recipe {
  name: string
  template: 'Bounty' | 'Event' | 'Staking House' | 'Tournament' | 'Grant Round' | 'Group Fund'
  widgets: Array<'kycFern' | 'tickets' | 'cctpCircle' | 'lzMirror' | 'vrf' | 'farcaster'>
  token: 'USDC'
  chain: 'Flow'
  durationDays?: number
  targetAmount?: number
  allocation?: {
    prizes: number
    ops: number
    buffer: number
  }
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

const PRESET_PROMPTS = [
  {
    title: "🏠 Hacker House",
    description: "Accommodation staking pool",
    prompt: "Hacker house with 20 accommodations, $50 stake, returned after the participant submits the hackathon project"
  },
  {
    title: "🎰 Farcaster Lottery",
    description: "Social media lottery",
    prompt: "Random lottery number, ticket $1, must follow someone on farcaster, winner gets 90% of the pool prize"
  },
  {
    title: "🃏 Poker Tournament",
    description: "Multi-round competition",
    prompt: "Weekly poker tournament, $25 buy-in, 8 players max, winner takes 70%, runner-up gets 20%, third place gets 10%"
  },
  {
    title: "🏀 March Madness Bracket",
    description: "Sports prediction contest",
    prompt: "Basketball bracket contest, $10 entry fee, predict tournament winners, most correct picks wins 80% of pool"
  },
  {
    title: "🎓 Learn2Earn Workshop",
    description: "Educational completion rewards",
    prompt: "Web3 development workshop, $20 deposit, refunded plus $30 bonus upon completing all modules and final project"
  },
  {
    title: "🐛 Bug Bounty Program",
    description: "Security vulnerability rewards",
    prompt: "Smart contract bug bounty, $500-5000 rewards based on severity, requires KYC verification, cross-chain compatible"
  }
]

export default function CreatePage() {
  const { isAuthenticated, user } = useNetwork()
  const { executeTransaction, transactionStatus, lastResult } = useFlowTransactions()
  const [prompt, setPrompt] = useState('')
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Metadata editing state
  const [editedName, setEditedName] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [bannerURL, setBannerURL] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  
  // Transaction state
  const [creating, setCreating] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [vaultId, setVaultId] = useState<number | null>(null)

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
      setEditedName(data.name)
      setEditedDescription(`${data.template} template with ${data.widgets.join(', ')} widgets`)
      setSaved(false)
    } catch (error) {
      console.error('Error generating recipe:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validateImageFile(file)
    if (error) {
      setImageError(error)
      return
    }

    setImageError(null)
    setSelectedImage(file)
    
    try {
      const metadata = await processImageFile(file)
      setImageMetadata(metadata)
    } catch (error) {
      console.error('Error processing image:', error)
      setImageError('Failed to process image')
    }
  }

  const createVaultOnChain = async () => {
    if (!recipe || !isAuthenticated || !user?.addr) {
      alert('Please connect wallet and generate a recipe first')
      return
    }

    setCreating(true)
    setTransactionId(null)
    setVaultId(null)

    try {
      const metadata = {
        name: editedName || recipe.name,
        description: editedDescription || `${recipe.template} template with ${recipe.widgets.join(', ')} widgets`,
        externalURL: undefined,
        bannerURL: bannerURL || undefined,
        image: imageMetadata || undefined
      }

      // Use the hook's executeTransaction method which properly handles wallet popup
      const code = `
import Registry from 0xRegistry
import Vaults from 0xVaults

transaction(
    orgAddr: Address,
    name: String,
    kind: UInt8,
    description: String,
    bannerCID: String?,
    logoCID: String?,
    externalURL: String?,
    acceptedIn: [String],
    payoutOut: [String],
    kycThresholdUsd: UFix64?,
    strategyHint: String?
) {
    let orgAccount: &Account
    let vaultCollection: &Vaults.VaultCollection
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Get org account
        self.orgAccount = getAccount(orgAddr)
        
        // Setup vault collection for org if not exists
        Vaults.setupVaultCollection(account: signer)
        
        // Borrow vault collection
        self.vaultCollection = signer.storage.borrow<&Vaults.VaultCollection>(
            from: Vaults.VaultCollectionStoragePath
        ) ?? panic("Could not borrow vault collection")
    }
    
    execute {
        // Create rails
        let rails = Vaults.Rails(acceptedIn: acceptedIn, payoutOut: payoutOut)
        
        // Create KYC if threshold provided
        let kyc = kycThresholdUsd != nil ? Vaults.KYC(thresholdUsd: kycThresholdUsd) : nil
        
        // Create vault kind enum
        let vaultKind = Vaults.VaultKind(rawValue: kind) ?? panic("Invalid vault kind")
        
        // Create vault init struct
        let vaultInit = Vaults.VaultInit(
            name: name,
            kind: vaultKind,
            description: description,
            bannerCID: bannerCID,
            logoCID: logoCID,
            externalURL: externalURL,
            rails: rails,
            kyc: kyc,
            strategyHint: strategyHint
        )
        
        // Create vault
        let vaultId = self.vaultCollection.createVault(vaultInit: vaultInit)
        
        log("Vault created with ID: ".concat(vaultId.toString()))
    }
}
      `

      const args = [
        { value: user.addr, type: 'Address' },
        { value: metadata.name, type: 'String' },
        { value: 0, type: 'UInt8' }, // vault kind
        { value: metadata.description, type: 'String' },
        { value: metadata.bannerURL || null, type: 'Optional(String)' },
        { value: metadata.image?.imageSVG || metadata.image?.imageURL || null, type: 'Optional(String)' },
        { value: metadata.externalURL || null, type: 'Optional(String)' },
        { value: ['USDC'], type: 'Array(String)' },
        { value: ['USDC'], type: 'Array(String)' },
        { value: null, type: 'Optional(UFix64)' },
        { value: null, type: 'Optional(String)' }
      ]

      const result = await executeTransaction(code, args)
      
      if (result.status === 'success' && result.transactionId) {
        setTransactionId(result.transactionId)
        // Extract vaultId from logs (this is a simplified approach)
        // In production, you'd parse the events properly
        setVaultId(Date.now()) // Placeholder - would extract from events
        setSaved(true)
      } else {
        throw new Error(result.error || 'Transaction failed')
      }
    } catch (error) {
      console.error('Error creating vault:', error)
      alert('Failed to create vault on-chain: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setCreating(false)
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
    <main className="min-h-screen bg-[#0b1020] text-white safe-area-top">
      <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 py-6 sm:py-10">
        <FlowConnect />

        <div className="relative">
          <img src="/assets/omnipools_banner_inline.png" alt="OmniPools" className="w-full rounded-2xl" />
          <div className="absolute inset-0 rounded-2xl bg-black/20" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Create New Pool</h1>
          <div className="flex gap-2">
            <Link href="/" className="rounded-xl bg-white/10 px-4 py-3 hover:bg-white/20 text-base font-medium min-h-[48px] flex items-center">
              Home
            </Link>
            <Link href="/pools" className="rounded-xl bg-white/10 px-4 py-3 hover:bg-white/20 text-base font-medium min-h-[48px] flex items-center">
              Pools
            </Link>
          </div>
        </div>

        <Card title="🤖 AI Recipe Generator">
          <div className="space-y-6">
            {/* Preset Prompts */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
                Quick Start Templates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRESET_PROMPTS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(preset.prompt)}
                    className="text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{preset.title.split(' ')[0]}</span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-white group-hover:text-blue-200 transition-colors">
                          {preset.title.slice(2)}
                        </h4>
                        <p className="text-sm text-white/60 mt-1">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="prompt" className="block text-base sm:text-lg font-semibold text-white mb-3">
                Or describe your own pool
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A hackathon bounty for the best DeFi protocol with KYC verification and cross-chain transfers..."
                className="w-full h-40 sm:h-32 rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-6 text-base sm:text-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                rows={4}
              />
            </div>
            
            <button
              onClick={generateRecipe}
              disabled={loading || !prompt.trim()}
              className={`
                w-full rounded-2xl px-6 py-4 sm:py-5 text-base sm:text-lg font-bold transition-all duration-200 min-h-[56px]
                ${loading || !prompt.trim()
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg'
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Generating Recipe...
                </span>
              ) : (
                '✨ Generate Recipe with AI'
              )}
            </button>
          </div>
        </Card>

        {recipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card title="Review & Create Pool">
              <div className="space-y-6">
                {/* Editable metadata form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-white mb-3">
                        Pool Name
                      </label>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 text-base sm:text-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all min-h-[56px]"
                        placeholder="Enter pool name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-white mb-3">
                        Description
                      </label>
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        rows={4}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 text-base sm:text-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        placeholder="Enter description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-white mb-3">
                        Banner URL (optional)
                      </label>
                      <input
                        type="url"
                        value={bannerURL}
                        onChange={(e) => setBannerURL(e.target.value)}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 text-base sm:text-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all min-h-[56px]"
                        placeholder="https://example.com/banner.png"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-white mb-3">
                        Pool Image (optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 text-base text-white file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-base file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:font-medium min-h-[56px]"
                      />
                      {imageError && (
                        <p className="text-red-400 text-sm mt-1">{imageError}</p>
                      )}
                      {imageMetadata && (
                        <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <p className="text-green-200 text-sm">
                            {imageMetadata.imageSVG ? 
                              `✓ SVG will be stored on-chain (${Math.round(selectedImage!.size / 1024)}KB)` :
                              `✓ Image hash: ${imageMetadata.imageHash?.slice(0, 16)}...`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <h4 className="font-medium mb-3">Recipe Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-white/60">Template:</span>
                          <span className="text-white/80">{recipe.template}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/60">Token:</span>
                          <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-200">
                            {recipe.token}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/60">Chain:</span>
                          <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-200">
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
                            <span className="text-white/60">Target:</span>
                            <span className="text-white/80">{recipe.targetAmount} USDC</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-white/60 text-sm">Widgets:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {recipe.widgets.map((widget) => (
                            <span
                              key={widget}
                              className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/80"
                            >
                              {widget}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fern Currency Conversion for Pool Funding */}
                {recipe.widgets.includes('kycFern') && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Fund Your Pool</h4>
                    <p className="text-white/70 text-sm">
                      Convert fiat currency to USDC to fund your pool using Fern's secure payment infrastructure.
                    </p>
                    <FernCurrencyConverter
                      defaultSourceCurrency="USD"
                      defaultDestinationCurrency="USDC"
                      defaultAmount={recipe.targetAmount?.toString() || ''}
                      onConversionComplete={(transaction) => {
                        console.log('Pool funding conversion completed:', transaction)
                        // Could trigger automatic vault funding here
                      }}
                    />
                  </div>
                )}

                {/* Transaction status */}
                {transactionId && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
                  >
                    <p className="text-blue-200 text-sm">
                      Transaction ID: <code className="bg-blue-500/20 px-2 py-1 rounded">{transactionId}</code>
                    </p>
                  </motion.div>
                )}

                {/* Action buttons - Mobile-first */}
                <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-3">
                  {!isAuthenticated ? (
                    <div className="text-white/60 text-base sm:text-lg p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">⚠️</span>
                        <span className="font-medium">Wallet Required</span>
                      </div>
                      Please connect your wallet to create a pool on-chain
                    </div>
                  ) : (
                    <button
                      onClick={createVaultOnChain}
                      disabled={transactionStatus === 'pending' || saved || !editedName.trim()}
                      className={`
                        w-full sm:flex-1 rounded-2xl px-6 py-4 sm:py-5 text-base sm:text-lg font-bold transition-all duration-200 min-h-[56px]
                        ${transactionStatus === 'pending'
                          ? 'bg-blue-500/50 text-blue-200 cursor-not-allowed'
                          : saved || transactionStatus === 'success'
                          ? 'bg-green-500/20 text-green-200 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg'
                        }
                      `}
                    >
                      {transactionStatus === 'pending' ? (
                        <span className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
                          Creating on Flow...
                        </span>
                      ) : saved || transactionStatus === 'success' ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="text-xl">✅</span>
                          Pool Created!
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span className="text-xl">🚀</span>
                          Create Pool on Flow
                        </span>
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={saveAsVault2}
                    disabled={saved}
                    className={`
                      w-full sm:w-auto rounded-2xl px-6 py-4 sm:py-5 text-base sm:text-lg font-bold transition-all duration-200 min-h-[56px]
                      ${saved
                        ? 'bg-green-500/20 text-green-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:scale-[1.02] active:scale-[0.98]'
                      }
                    `}
                  >
                    {saved ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="text-xl">✅</span>
                        Saved as Demo
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span className="text-xl">💾</span>
                        Save as Demo
                      </span>
                    )}
                  </button>
                  
                  {(saved || vaultId) && (
                    <Link
                      href="/pools"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 sm:py-5 text-base sm:text-lg font-bold text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-h-[56px]"
                    >
                      <span className="text-xl">🏊‍♂️</span>
                      View Pools
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  )
} 