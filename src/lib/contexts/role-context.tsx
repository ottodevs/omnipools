'use client'

import type { ReactNode } from 'react'
import { createContext, use, useEffect, useState } from 'react'

export type UserRole = 'Organizer' | 'Sponsor' | 'Participant'

interface RoleContextType {
  currentRole: UserRole
  switchRole: (role: UserRole) => void
  isHydrated: boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [currentRole, setCurrentRole] = useState<UserRole>('Organizer')

  // Safe hydration: sync with localStorage only after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user-role') as UserRole
      if (saved && ['Organizer', 'Sponsor', 'Participant'].includes(saved)) {
        setCurrentRole(saved)
      }
      setIsHydrated(true)
    }
  }, [])

  const switchRole = (role: UserRole) => {
    setCurrentRole(role)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-role', role)
    }

    console.log('🔄 Switched to role:', role)
  }

  return (
    <RoleContext value={{
      currentRole,
      switchRole,
      isHydrated,
    }}
    >
      {children}
    </RoleContext>
  )
}

export function useRole() {
  const context = use(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
} 