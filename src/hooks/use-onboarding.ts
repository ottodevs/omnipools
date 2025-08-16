// hooks/useOnboardingToggle.ts (simplified for demo)
'use client'
import { useCallback, useEffect, useState } from 'react'
import { COOKIE_KEYS } from '@/lib/constants'

function getOnboardingFromStorage(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(COOKIE_KEYS.ONBOARDING_COOKIE_KEY) === 'true'
}

function setOnboardingInStorage(value: boolean): boolean {
  if (typeof window === 'undefined') return false
  localStorage.setItem(COOKIE_KEYS.ONBOARDING_COOKIE_KEY, String(value))
  return value
}

export default function useOnboarding(): {
  completed: boolean
  setCompleted: () => Promise<void>
  loading: boolean
  error?: Error
} {
  const [completed, setCompletedState] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>()

  // Fetch initial state on mount
  useEffect(() => {
    const initialValue = getOnboardingFromStorage()
    setCompletedState(initialValue)
  }, [])

  const setCompleted = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      const val = setOnboardingInStorage(true)
      setCompletedState(val)
    }
    catch (e: unknown) {
      setError(e as Error)
      throw e
    }
    finally {
      setLoading(false)
    }
  }, [])

  return { completed, setCompleted, loading, error }
}
