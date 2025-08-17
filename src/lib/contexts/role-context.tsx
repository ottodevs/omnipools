'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'Organizer' | 'Sponsor' | 'Participant'

interface RoleContextType {
  role: UserRole | null
  setRole: (role: UserRole) => void
  clearRole: () => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null)

  // Load role from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('user-role') as UserRole
      if (savedRole && ['Organizer', 'Sponsor', 'Participant'].includes(savedRole)) {
        setRoleState(savedRole)
      }
    }
  }, [])

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-role', newRole)
    }
  }

  const clearRole = () => {
    setRoleState(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user-role')
    }
  }

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}