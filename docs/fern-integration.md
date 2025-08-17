# Fern Integration

## Overview

This project integrates with [Fern](https://fernhq.com) to provide seamless currency conversion and global payment capabilities, enabling users to fund pools with fiat currency and receive payouts in their preferred currency.

## Features

### 🔄 Currency Conversion
- **Fiat to Crypto**: Convert USD, EUR, GBP and other fiat currencies to USDC for pool funding
- **Crypto to Fiat**: Convert USDC prizes to fiat currency for winner payouts
- **Real-time Exchange Rates**: Live exchange rates for accurate conversions
- **Multiple Payment Methods**: Support for ACH, wire transfers, SEPA, and more

### 👛 Wallet Management
- **Multi-Currency Wallets**: Create wallets for different currencies and networks
- **Balance Tracking**: Real-time balance updates across all currencies
- **Transaction History**: Complete transaction logs and status tracking

### 🌍 Global Compliance
- **KYC/KYB Integration**: Fern handles customer verification globally
- **Regulatory Compliance**: Licensed liquidity providers and regulatory reporting
- **Multi-Jurisdiction Support**: Operate legally across different countries

### 💸 Seamless Payouts
- **Automated Conversions**: Convert crypto prizes to fiat automatically
- **Bank Integration**: Direct payments to winners' bank accounts
- **Weak Guarantees**: Graceful handling of failed conversions

## API Integration

### Environment Setup

```bash
# Add to .env.local
FERN_API_KEY=your_fern_api_key_here
NEXT_PUBLIC_FERN_API_KEY=your_fern_api_key_here
```

### Core Components

#### FernCurrencyConverter
Enables users to convert between fiat and crypto currencies.

```tsx
import FernCurrencyConverter from '@/components/fern-currency-converter'

<FernCurrencyConverter
  defaultSourceCurrency="USD"
  defaultDestinationCurrency="USDC"
  defaultAmount="1000"
  onConversionComplete={(transaction) => {
    console.log('Conversion completed:', transaction)
  }}
/>
```

#### FernWalletManager
Manages user wallets and displays balances.

```tsx
import FernWalletManager from '@/components/fern-wallet-manager'

<FernWalletManager 
  onWalletSelect={(wallet) => console.log('Selected:', wallet)}
  showTransactions={true}
/>
```

#### FernPayoutConverter
Converts crypto prizes to fiat for winners.

```tsx
import FernPayoutConverter from '@/components/fern-payout-converter'

<FernPayoutConverter
  winners={[
    { address: '0x123...', amount: 500 },
    { address: '0xabc...', amount: 300 }
  ]}
  onPayoutConversion={(conversions) => {
    console.log('Payouts converted:', conversions)
  }}
/>
```

### API Client

The Fern client provides methods for all major operations:

```typescript
import { getFernClient } from '@/lib/fern/client'

const fern = getFernClient()

// Create customer
const customer = await fern.createCustomer({
  email: 'user@example.com',
  type: 'individual',
  firstName: 'John',
  lastName: 'Doe'
})

// Create wallet
const wallet = await fern.createWallet(customer.id, 'USDC')

// Get quote for conversion
const quote = await fern.getQuote({
  customerId: customer.id,
  source: {
    accountId: sourceWallet.id,
    currency: 'USD',
    paymentMethod: 'ACH',
    amount: '1000'
  },
  destination: {
    accountId: destWallet.id,
    currency: 'USDC',
    paymentMethod: 'Ethereum'
  }
})

// Execute transaction
const transaction = await fern.createTransaction(quote.id)
```

## Integration Points

### Pool Creation (Create Page)
- **Funding Options**: Users can fund pools using fiat currency
- **Automatic Conversion**: Fiat funds are converted to USDC for on-chain operations
- **KYC Integration**: Seamless customer verification for compliance

### Vault Management (Vault Page)
- **Organizer Features**: 
  - Fund pools with fiat currency
  - Manage multi-currency wallets
  - Convert prizes to fiat for payouts
- **Participant Features**: 
  - Link bank accounts for fiat payouts
  - Choose preferred payout currency

### Global Access (Pools Page)
- **Demo Interface**: Interactive demo of all Fern features
- **Feature Showcase**: Live examples of currency conversion and wallet management

## Webhooks

The app includes webhook handlers for real-time updates:

```typescript
// POST /api/fern/webhooks
// Handles events: transaction.completed, transaction.failed, customer.verified, wallet.created
```

## Testing

Test the integration using the built-in endpoints:

```bash
# Test API connectivity
curl http://localhost:3000/api/fern/test

# Test customer creation
curl -X POST http://localhost:3000/api/fern/test \
  -H "Content-Type: application/json" \
  -d '{"action": "create-customer", "email": "test@example.com", "type": "individual"}'
```

## Track Requirements

This integration fulfills the "📲 Best Consumer App on Fern" track requirements:

- ✅ **Account Created**: Set up at dashboard.fernhq.com
- ✅ **API Usage**: Full integration with Fern's API
- ✅ **Currency Conversion**: Implemented currency conversion functionality
- ✅ **Live Money Movement**: Functional demonstration of money movement between fiat and crypto

## Benefits for OmniPools

1. **Lower Barrier to Entry**: Users can participate without owning crypto
2. **Global Accessibility**: Support for 50+ currencies enables worldwide participation
3. **Seamless UX**: Fiat funding and payouts feel like traditional banking
4. **Compliance Ready**: Fern handles all regulatory requirements
5. **Revenue Opportunities**: Earn fees on currency conversions

## Next Steps

1. **Production Setup**: Replace demo API key with production credentials
2. **Enhanced UX**: Add more sophisticated UI/UX for currency selection
3. **Automation**: Implement automatic funding and payout workflows
4. **Analytics**: Track conversion volumes and user preferences
5. **Mobile Optimization**: Ensure mobile-first experience for global users