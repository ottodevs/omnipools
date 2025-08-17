import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
  hasCompletedOnboarding: boolean
  currentStep: number
  completeOnboarding: () => void
  setCurrentStep: (step: number) => void
  resetOnboarding: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      currentStep: 0,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setCurrentStep: (step: number) => set({ currentStep: step }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false, currentStep: 0 }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
)