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

import { motion, AnimatePresence } from 'framer-motion'

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
  kind: string
  status: string
  createdAt: string
}

const PRESET_PROMPTS = [
  "Create a hackathon with $10k USDC prizes for 200 participants",
  "Set up group funding for community project with $5k target",
  "Launch bounty program with KYC requirement and Circle CCTP",
  "Organize tournament with ticket system and VRF for random rewards"
]

// Step definitions
type Step = 'template' | 'details' | 'settings' | 'review' | 'deploy'

const STEPS: { key: Step; title: string; description: string }[] = [
  { key: 'template', title: 'Choose Template', description: 'Select your pool type and generate configuration' },
  { key: 'details', title: 'Pool Details', description: 'Set name, description, and visual assets' },
  { key: 'settings', title: 'Configuration', description: 'Configure rules, duration, and features' },
  { key: 'review', title: 'Review', description: 'Review your configuration before deployment' },
  { key: 'deploy', title: 'Deploy', description: 'Deploy your pool to the blockchain' }
]

export default function CreatePage() {
  const { isAuthenticated, user } = useNetwork()
  const { executeTransaction } = useFlowTransactions()
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('template')
  const currentStepIndex = STEPS.findIndex(s => s.key === currentStep)
  
  // Template step state
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  
  // Details step state  
  const [editedName, setEditedName] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [bannerURL, setBannerURL] = useState('')
  
  // Settings step state
  const [duration, setDuration] = useState<number>(30)
  const [targetAmount, setTargetAmount] = useState<number>(10000)
  const [enableKyc, setEnableKyc] = useState(false)
  const [kycThreshold, setKycThreshold] = useState<number>(1000)
  
  // Deploy step state
  const [isCreating, setCreating] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [vaultId, setVaultId] = useState<number | null>(null)
  const [createdVault, setCreatedVault] = useState<Vault2 | null>(null)

  const generateRecipe = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) throw new Error('Failed to generate recipe')

      const data = await response.json()
      setRecipe(data.recipe)
      setEditedName(data.recipe.name)
      setEditedDescription(`${data.recipe.template} template with ${data.recipe.widgets.join(', ')} widgets`)
      setDuration(data.recipe.durationDays || 30)
      setTargetAmount(data.recipe.targetAmount || 10000)
    } catch (error) {
      console.error('Error generating recipe:', error)
      alert('Failed to generate recipe. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setSelectedImage(null)
      setImageMetadata(null)
      setImageError(null)
      return
    }

    const validationError = validateImageFile(file)
    if (validationError) {
      setImageError(validationError)
      setSelectedImage(null)
      setImageMetadata(null)
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
      setImageMetadata(null)
    }
  }

  const createVaultOnChain = async () => {
    if (!recipe || !isAuthenticated || !user?.addr) {
      alert('Please connect wallet and configure your pool first')
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
        let kyc = kycThresholdUsd != nil ? Vaults.KYC(thresholdUsd: kycThresholdUsd!) : nil
        
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
        { value: enableKyc ? kycThreshold.toString() : null, type: 'Optional(UFix64)' },
        { value: null, type: 'Optional(String)' }
      ]

      const result = await executeTransaction(code, args)
      
      if (result.status === 'success' && result.transactionId) {
        setTransactionId(result.transactionId)
        // Extract vaultId from logs (this is a simplified approach)
        // In production, you'd parse the events properly
        const vaultIdFromLogs = Math.floor(Math.random() * 1000) + 1 // Mock for now
        setVaultId(vaultIdFromLogs)
        
        setCreatedVault({
          vaultId: vaultIdFromLogs,
          org: user.addr,
          name: metadata.name,
          description: metadata.description,
          kind: recipe.template,
          status: 'Active',
          createdAt: new Date().toISOString()
        })
      } else {
        throw new Error(result.error || 'Transaction failed')
      }
    } catch (error) {
      console.error('Error creating vault:', error)
      alert('Failed to create pool. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].key)
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].key)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'template':
        return recipe !== null
      case 'details':
        return editedName.trim() !== '' && editedDescription.trim() !== ''
      case 'settings':
        return duration > 0 && targetAmount > 0
      case 'review':
        return isAuthenticated
      case 'deploy':
        return false // Can't proceed from deploy
      default:
        return false
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
            ${index <= currentStepIndex ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'}
          `}>
            {index + 1}
          </div>
          <div className="ml-3 mr-6">
            <div className={`text-sm font-medium ${index <= currentStepIndex ? 'text-white' : 'text-gray-400'}`}>
              {step.title}
            </div>
            <div className="text-xs text-gray-400">{step.description}</div>
          </div>
          {index < STEPS.length - 1 && (
            <div className={`w-8 h-0.5 ${index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-600'}`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderTemplateStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your Pool Template</h2>
        <p className="text-gray-300">Describe what you want to create and we'll configure it for you</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-lg font-semibold text-white mb-3">
            Describe your pool
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create a hackathon with $10k USDC prizes for 200 participants"
            className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 p-5 text-white placeholder-gray-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESET_PROMPTS.map((presetPrompt, index) => (
            <button
              key={index}
              onClick={() => setPrompt(presetPrompt)}
              className="p-4 rounded-xl bg-white/5 border border-white/10 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors"
            >
              {presetPrompt}
            </button>
          ))}
        </div>

        <button
          onClick={generateRecipe}
          disabled={!prompt.trim() || isGenerating}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate Pool Configuration'}
        </button>
      </div>

      {recipe && (
        <Card title="Generated Configuration">
          <div className="space-y-3">
            <div><span className="text-gray-400">Name:</span> <span className="text-white">{recipe.name}</span></div>
            <div><span className="text-gray-400">Template:</span> <span className="text-white">{recipe.template}</span></div>
            <div><span className="text-gray-400">Widgets:</span> <span className="text-white">{recipe.widgets.join(', ')}</span></div>
            <div><span className="text-gray-400">Token:</span> <span className="text-white">{recipe.token}</span></div>
            <div><span className="text-gray-400">Chain:</span> <span className="text-white">{recipe.chain}</span></div>
            {recipe.durationDays && (
              <div><span className="text-gray-400">Duration:</span> <span className="text-white">{recipe.durationDays} days</span></div>
            )}
            {recipe.targetAmount && (
              <div><span className="text-gray-400">Target:</span> <span className="text-white">${recipe.targetAmount.toLocaleString()} {recipe.token}</span></div>
            )}
          </div>
        </Card>
      )}
    </motion.div>
  )

  const renderDetailsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Pool Details</h2>
        <p className="text-gray-300">Customize your pool's name, description, and visual identity</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-lg font-semibold text-white mb-3">Pool Name</label>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 text-white placeholder-gray-400"
            placeholder="Enter pool name"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-white mb-3">Description</label>
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 p-5 text-white placeholder-gray-400 resize-none"
            placeholder="Describe your pool"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-white mb-3">Pool Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 text-white file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:font-medium"
          />
          {imageError && (
            <p className="text-red-400 text-sm mt-2">{imageError}</p>
          )}
          {imageMetadata && (
            <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-green-200 text-sm">
                {imageMetadata.imageSVG ? 
                  `✓ SVG will be stored on-chain (${Math.round(selectedImage!.size / 1024)}KB)` :
                  `✓ Image processed successfully`
                }
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-lg font-semibold text-white mb-3">Banner URL (optional)</label>
          <input
            type="url"
            value={bannerURL}
            onChange={(e) => setBannerURL(e.target.value)}
            className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 text-white placeholder-gray-400"
            placeholder="https://example.com/banner.jpg"
          />
        </div>
      </div>
    </motion.div>
  )

  const renderSettingsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Configuration</h2>
        <p className="text-gray-300">Set up rules, duration, and advanced features</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-semibold text-white mb-3">Duration (days)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              min="1"
              className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 text-white"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-white mb-3">Target Amount (USDC)</label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(parseInt(e.target.value) || 0)}
              min="1"
              className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableKyc"
              checked={enableKyc}
              onChange={(e) => setEnableKyc(e.target.checked)}
              className="w-5 h-5 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="enableKyc" className="text-lg font-medium text-white">
              Enable KYC Requirements
            </label>
          </div>

          {enableKyc && (
            <div className="ml-8">
              <label className="block text-base font-medium text-white mb-2">KYC Threshold (USD)</label>
              <input
                type="number"
                value={kycThreshold}
                onChange={(e) => setKycThreshold(parseInt(e.target.value) || 0)}
                min="1"
                className="w-64 rounded-xl bg-white/5 border border-white/10 p-3 text-white"
              />
              <p className="text-sm text-gray-400 mt-1">
                Participants with contributions above this amount will need KYC verification
              </p>
            </div>
          )}
        </div>

        {recipe && (
          <Card title="Selected Features">
            <div className="space-y-2">
              <div><span className="text-gray-400">Template:</span> <span className="text-white">{recipe.template}</span></div>
              <div><span className="text-gray-400">Widgets:</span> <span className="text-white">{recipe.widgets.join(', ')}</span></div>
              <div><span className="text-gray-400">Token:</span> <span className="text-white">{recipe.token} on {recipe.chain}</span></div>
            </div>
          </Card>
        )}
      </div>
    </motion.div>
  )

  const renderReviewStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Review Configuration</h2>
        <p className="text-gray-300">Review all settings before deploying your pool</p>
      </div>

      <Card title="Pool Summary">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-400">Name:</span> <span className="text-white">{editedName}</span></div>
                <div><span className="text-gray-400">Description:</span> <span className="text-white">{editedDescription}</span></div>
                <div><span className="text-gray-400">Template:</span> <span className="text-white">{recipe?.template}</span></div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Configuration</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-400">Duration:</span> <span className="text-white">{duration} days</span></div>
                <div><span className="text-gray-400">Target Amount:</span> <span className="text-white">${targetAmount.toLocaleString()} USDC</span></div>
                <div><span className="text-gray-400">KYC:</span> <span className="text-white">{enableKyc ? `Enabled (threshold: $${kycThreshold})` : 'Disabled'}</span></div>
              </div>
            </div>
          </div>

          {recipe && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Features</h4>
              <div className="flex flex-wrap gap-2">
                {recipe.widgets.map((widget) => (
                  <span key={widget} className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm">
                    {widget}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(imageMetadata || bannerURL) && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Visual Assets</h4>
              <div className="space-y-2 text-sm">
                {imageMetadata && (
                  <div><span className="text-gray-400">Pool Image:</span> <span className="text-green-400">✓ Uploaded</span></div>
                )}
                {bannerURL && (
                  <div><span className="text-gray-400">Banner URL:</span> <span className="text-white">{bannerURL}</span></div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {!isAuthenticated && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-6 lg:p-8 shadow-lg backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="text-amber-400">⚠️</div>
            <div>
              <h4 className="text-lg font-semibold text-amber-400">Wallet Connection Required</h4>
              <p className="text-amber-200">Please connect your wallet to deploy the pool</p>
            </div>
          </div>
          <div className="mt-4">
            <FlowConnect />
          </div>
        </div>
      )}
    </motion.div>
  )

  const renderDeployStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Deploy Pool</h2>
        <p className="text-gray-300">Deploy your pool to the Flow blockchain</p>
      </div>

      {!createdVault ? (
        <Card title="Deploy Pool">
          <div className="text-center space-y-6">
            <button
              onClick={createVaultOnChain}
              disabled={isCreating || !isAuthenticated}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-colors"
            >
              {isCreating ? 'Deploying Pool...' : 'Deploy Pool to Blockchain'}
            </button>

            {isCreating && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-300">Please confirm the transaction in your wallet...</p>
              </div>
            )}

            {transactionId && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-200 text-sm">
                  Transaction ID: <code className="bg-black/20 px-2 py-1 rounded">{transactionId}</code>
                </p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 sm:p-6 lg:p-8 shadow-lg backdrop-blur-md">
          <div className="text-center space-y-6">
            <div className="text-green-400 text-6xl">✅</div>
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">Pool Created Successfully!</h3>
              <p className="text-green-200">Your pool has been deployed to the blockchain</p>
            </div>

            <div className="space-y-3 text-left">
              <div><span className="text-gray-400">Pool ID:</span> <span className="text-white">{createdVault.vaultId}</span></div>
              <div><span className="text-gray-400">Name:</span> <span className="text-white">{createdVault.name}</span></div>
              <div><span className="text-gray-400">Status:</span> <span className="text-green-400">{createdVault.status}</span></div>
              {transactionId && (
                <div><span className="text-gray-400">Transaction:</span> <code className="text-white bg-black/20 px-2 py-1 rounded">{transactionId}</code></div>
              )}
            </div>

            <div className="flex space-x-4">
              <Link 
                href={`/vault/${createdVault.vaultId}`}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-center"
              >
                View Pool
              </Link>
              <Link 
                href="/pools"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-center"
              >
                Browse Pools
              </Link>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'template':
        return renderTemplateStep()
      case 'details':
        return renderDetailsStep()
      case 'settings':
        return renderSettingsStep()
      case 'review':
        return renderReviewStep()
      case 'deploy':
        return renderDeployStep()
      default:
        return renderTemplateStep()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Create Pool
          </h1>
          <p className="text-xl text-gray-300">
            Deploy your own liquidity pool or funding mechanism
          </p>
        </div>

        {renderStepIndicator()}

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {renderCurrentStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              Previous
            </button>

            {currentStep !== 'deploy' && (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
              >
                {currentStep === 'review' ? 'Deploy' : 'Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}