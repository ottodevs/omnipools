'use client'

import { useRole } from '@/lib/contexts/role-context'

export default function RoleSelector() {
  const { role, setRole } = useRole()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-white/60">Role:</span>
      <select
        value={role || ''}
        onChange={(e) => setRole(e.target.value as any)}
        className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white border border-white/20 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="Organizer">Organizer</option>
        <option value="Sponsor">Sponsor</option>
        <option value="Participant">Participant</option>
      </select>
    </div>
  )
} 