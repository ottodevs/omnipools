import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'

// Strict schema for Recipe object
const RecipeSchema = z.object({
  name: z.string(),
  template: z.enum(['Bounty', 'Event', 'Staking House', 'Tournament', 'Grant Round', 'Group Fund']),
  widgets: z.array(z.enum(['kycFern', 'tickets', 'cctpCircle', 'lzMirror', 'vrf', 'farcaster'])),
  token: z.literal('USDC'),
  chain: z.literal('Flow'),
  durationDays: z.number().optional(),
  targetAmount: z.number().optional(),
  allocation: z.object({
    prizes: z.number(),
    ops: z.number(),
    buffer: z.number()
  }).optional(),
})

type Recipe = z.infer<typeof RecipeSchema>

// Deterministic fallback function
function generateFallbackRecipe(prompt: string): Recipe {
  const promptLower = prompt.toLowerCase()
  const words = promptLower.split(/\s+/)
  
  // Extract template from prompt
  let template: 'Bounty' | 'Event' | 'Staking House' | 'Tournament' | 'Grant Round' | 'Group Fund' = 'Bounty'
  if (words.includes('event') || words.includes('meetup') || words.includes('conference')) {
    template = 'Event'
  } else if (words.includes('staking') || words.includes('house') || words.includes('farm')) {
    template = 'Staking House'
  } else if (words.includes('tournament') || words.includes('competition') || words.includes('contest')) {
    template = 'Tournament'
  } else if (words.includes('grant') || words.includes('funding') || words.includes('round')) {
    template = 'Grant Round'
  } else if (words.includes('group') || words.includes('fund') || words.includes('pool')) {
    template = 'Group Fund'
  }
  
  // Extract widgets from prompt
  const widgets: Array<'kycFern' | 'tickets' | 'cctpCircle' | 'lzMirror' | 'vrf' | 'farcaster'> = ['cctpCircle']
  
  if (words.includes('kyc') || words.includes('fern') || words.includes('identity')) {
    widgets.push('kycFern')
  }
  if (words.includes('lz') || words.includes('layerzero') || words.includes('mirror')) {
    widgets.push('lzMirror')
  }
  if (words.includes('ticket') || words.includes('nft') || words.includes('access')) {
    widgets.push('tickets')
  }
  if (words.includes('vrf') || words.includes('random') || words.includes('lottery')) {
    widgets.push('vrf')
  }
  if (words.includes('farcaster') || words.includes('social') || words.includes('cast')) {
    widgets.push('farcaster')
  }
  
  // Generate name based on template and widgets
  const widgetNames = widgets.map(w => w.replace(/([A-Z])/g, ' $1').trim())
  const name = `${template} with ${widgetNames.join(' and ')}`
  
  // Extract duration if mentioned
  let durationDays: number | undefined
  const durationMatch = prompt.match(/(\d+)\s*(day|days)/i)
  if (durationMatch) {
    durationDays = parseInt(durationMatch[1])
  }
  
  // Extract amount if mentioned
  let targetAmount: number | undefined
  const amountMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(usdc|dollar|dollars)/i)
  if (amountMatch) {
    targetAmount = parseFloat(amountMatch[1])
  }
  
  return {
    name,
    template,
    widgets,
    token: 'USDC',
    chain: 'Flow',
    durationDays,
    targetAmount,
  }
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    const openaiApiKey = process.env.OPENAI_API_KEY
    
    if (!openaiApiKey) {
      // Offline fallback mode
      const fallbackRecipe = generateFallbackRecipe(prompt)
      return new Response(JSON.stringify(fallbackRecipe), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Online mode with OpenAI
    const result = await streamObject({
      model: openai('gpt-4o-mini'),
      schema: RecipeSchema,
      prompt: `Generate a recipe for a Flow blockchain vault based on this description: "${prompt}". 
      
The recipe should be for a vault that can be created on the Flow blockchain using USDC tokens. 
Include appropriate widgets based on the functionality described in the prompt.

Available widgets:
- kycFern: For identity verification and KYC processes
- cctpCircle: For cross-chain token transfers via Circle CCTP
- lzMirror: For LayerZero cross-chain functionality
- tickets: For NFT-based access control or ticketing
- vrf: For verifiable random functions and lottery mechanics
- farcaster: For social features and Farcaster integration

Available templates:
- Bounty: For hackathons, bug bounties, or reward programs
- Event: For conferences, meetups, or community events  
- Staking House: For staking pools, farming, or yield generation
- Tournament: For competitions with multiple rounds and rankings
- Grant Round: For funding rounds, grants, and investment pools
- Group Fund: For collective funding and shared resources

Generate a creative and descriptive name for the vault.`,
    })
    
    return result.toTextStreamResponse()
    
  } catch (error) {
    console.error('Error in recipe API:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
} 