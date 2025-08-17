/**
 * Fern Webhook Handler
 * Handles webhook events from Fern API for transaction updates
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface FernWebhookEvent {
  id: string
  type: 'transaction.completed' | 'transaction.failed' | 'customer.verified' | 'wallet.created'
  data: {
    transactionId?: string
    customerId?: string
    walletId?: string
    status?: string
    amount?: string
    currency?: string
    error?: string
  }
  timestamp: string
}

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-fern-signature')
    
    // Verify webhook signature (in production, you'd have a webhook secret)
    const webhookSecret = process.env.FERN_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(body, signature, webhookSecret)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        )
      }
    }

    const event: FernWebhookEvent = JSON.parse(body)
    
    console.log('Received Fern webhook:', event)

    // Handle different event types
    switch (event.type) {
      case 'transaction.completed':
        await handleTransactionCompleted(event)
        break
      
      case 'transaction.failed':
        await handleTransactionFailed(event)
        break
      
      case 'customer.verified':
        await handleCustomerVerified(event)
        break
      
      case 'wallet.created':
        await handleWalletCreated(event)
        break
      
      default:
        console.log('Unhandled webhook event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing Fern webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleTransactionCompleted(event: FernWebhookEvent) {
  const { transactionId, amount, currency } = event.data
  
  console.log(`Transaction ${transactionId} completed: ${amount} ${currency}`)
  
  // Here you could:
  // 1. Update local database with transaction status
  // 2. Trigger Flow blockchain transactions for vault funding
  // 3. Send notifications to users
  // 4. Update UI state via WebSocket/SSE
  
  // Example: If this was a funding transaction, trigger vault funding
  if (currency === 'USDC') {
    // Could trigger Flow transaction to fund the vault
    console.log('USDC conversion completed, ready to fund vault')
  }
}

async function handleTransactionFailed(event: FernWebhookEvent) {
  const { transactionId, error } = event.data
  
  console.log(`Transaction ${transactionId} failed:`, error)
  
  // Handle failed transactions
  // 1. Log the failure
  // 2. Notify the user
  // 3. Potentially retry or offer alternatives
}

async function handleCustomerVerified(event: FernWebhookEvent) {
  const { customerId } = event.data
  
  console.log(`Customer ${customerId} verified`)
  
  // Handle customer verification
  // 1. Update customer status in local database
  // 2. Enable additional features for verified customers
  // 3. Send welcome email or notification
}

async function handleWalletCreated(event: FernWebhookEvent) {
  const { walletId, customerId, currency } = event.data
  
  console.log(`Wallet ${walletId} created for customer ${customerId} (${currency})`)
  
  // Handle new wallet creation
  // 1. Store wallet info in local database
  // 2. Set up automatic funding rules if needed
  // 3. Notify user that wallet is ready
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'healthy', service: 'fern-webhooks' })
}