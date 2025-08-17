/**
 * Fern Integration Demo Component
 * Showcases all Fern features in the omnipools app
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Card from './Card'
import FernCurrencyConverter from './fern-currency-converter'
import FernWalletManager from './fern-wallet-manager'
import FernPayoutConverter from './fern-payout-converter'
import { useFernCustomer } from '@/hooks/use-fern'

const DEMO_WINNERS = [
  { address: '0x1234567890abcdef1234567890abcdef12345678', amount: 500 },
  { address: '0xabcdef1234567890abcdef1234567890abcdef12', amount: 300 },
  { address: '0x567890abcdef1234567890abcdef1234567890ab', amount: 200 },
]

const FEATURES = [
  {
    title: 'Fiat to Crypto Onramps',
    description: 'Convert USD, EUR, GBP and other fiat currencies to USDC for pool funding',
    icon: '💳',
    component: 'converter'
  },
  {
    title: 'Multi-Currency Wallets',
    description: 'Create and manage wallets for different currencies and networks',
    icon: '👛',
    component: 'wallets'
  },
  {
    title: 'Crypto to Fiat Payouts',
    description: 'Convert USDC prizes to fiat currency and send to winners\' bank accounts',
    icon: '💸',
    component: 'payouts'
  },
  {
    title: 'Global Compliance',
    description: 'Fern handles KYC/KYB verification and regulatory compliance globally',
    icon: '🌍',
    component: 'compliance'
  },
]

export default function FernDemo() {
  const [activeFeature, setActiveFeature] = useState<string>('converter')
  const { customer } = useFernCustomer()

  const renderFeatureComponent = () => {
    switch (activeFeature) {
      case 'converter':
        return (
          <FernCurrencyConverter
            defaultSourceCurrency="USD"
            defaultDestinationCurrency="USDC"
            defaultAmount="1000"
            onConversionComplete={(transaction) => {
              console.log('Demo conversion completed:', transaction)
            }}
          />
        )
      
      case 'wallets':
        return (
          <FernWalletManager 
            onWalletSelect={(wallet) => console.log('Demo wallet selected:', wallet)}
            showTransactions={true}
          />
        )
      
      case 'payouts':
        return (
          <FernPayoutConverter
            winners={DEMO_WINNERS}
            onPayoutConversion={(conversions) => {
              console.log('Demo payout conversions:', conversions)
            }}
          />
        )
      
      case 'compliance':
        return (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="text-4xl">🛡️</div>
              <h3 className="text-lg font-semibold">Global Compliance</h3>
              <div className="text-gray-600 space-y-2">
                <p>Fern handles all compliance requirements:</p>
                <ul className="text-sm space-y-1 text-left max-w-md">
                  <li>• KYC/KYB verification forms</li>
                  <li>• Anti-money laundering (AML) monitoring</li>
                  <li>• Regulatory reporting</li>
                  <li>• Licensed liquidity providers</li>
                  <li>• Multi-jurisdiction support</li>
                </ul>
              </div>
              {customer && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-700">
                    ✅ Customer Status: {customer.status}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="text-4xl">🌿</div>
          <h2 className="text-2xl font-bold">Fern Integration Demo</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience seamless money movements between fiat and crypto. Fern enables global 
            on/offramps, currency conversion, and compliance-ready payments for your omnipools.
          </p>
          
          {/* Track Requirements */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📲 Best Consumer App on Fern Track</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>✅ Created account at dashboard.fernhq.com</div>
              <div>✅ Using Fern's API with secure authentication</div>
              <div>✅ Integrated currency conversion functionality</div>
              <div>✅ Demonstrating live money movement capabilities</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Feature Navigation */}
      <Card className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature) => (
            <motion.button
              key={feature.component}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFeature(feature.component)}
              className={`p-4 rounded-lg text-left transition-colors ${
                activeFeature === feature.component
                  ? 'bg-blue-100 border-blue-300 border-2'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-600">{feature.description}</p>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Active Feature Component */}
      <motion.div
        key={activeFeature}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderFeatureComponent()}
      </motion.div>

      {/* Integration Benefits */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Why Fern + OmniPools?</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="text-2xl mb-2">🚀</div>
            <h4 className="font-medium mb-2">Instant Onboarding</h4>
            <p className="text-sm text-gray-600">
              Users can fund pools with fiat currency without needing crypto knowledge
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="text-2xl mb-2">🌍</div>
            <h4 className="font-medium mb-2">Global Reach</h4>
            <p className="text-sm text-gray-600">
              Support for 50+ currencies enables worldwide participation in pools
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="text-2xl mb-2">💰</div>
            <h4 className="font-medium mb-2">Seamless Payouts</h4>
            <p className="text-sm text-gray-600">
              Winners receive fiat directly to their bank accounts, no crypto needed
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}