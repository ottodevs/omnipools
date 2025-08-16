// API Routes (simplified for demo)
export const API_ROUTES = {
  VAULT_DATA: '/data/vault-',
  SUMMARY_DATA: '/data/summary_after.json',
} as const

// Query Keys for TanStack Query (simplified for demo)
export const QUERY_KEYS = {
  VAULT: (id: string) => ['vault', id] as const,
  SUMMARY: ['summary'] as const,
} as const

// Onboarding Steps (simplified for demo)
export const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to OmniPools',
    description: 'Decentralized payout automation via Flow Actions.',
  },
  {
    id: 'demo',
    title: 'Demo Vault',
    description: 'View the ETHGlobal NY Bounties vault and its payout status.',
  },
] as const satisfies readonly {
  id: string
  title: string
  description: string
}[]

// Cookie Keys
export const COOKIE_KEYS = {
  ONBOARDING_COOKIE_KEY: 'onboarding-completed',
} as const
