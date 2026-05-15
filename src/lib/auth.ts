import type { User } from '@supabase/supabase-js'
import type { SessionUser } from '@/types'

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean)

export function isAdminUser(user: User | null): boolean {
  if (!user) return false

  const metadataRole = user.user_metadata?.role
  const appRole = user.app_metadata?.role
  const email = user.email?.toLowerCase()

  return metadataRole === 'admin' || appRole === 'admin' || (!!email && adminEmails.includes(email))
}

export function mapSupabaseUser(user: User): SessionUser {
  return {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Cliente',
    phone: user.user_metadata?.phone || '',
    email: user.email,
    lgpdAccepted: !!user.user_metadata?.lgpdAccepted,
    lgpdTimestamp: user.user_metadata?.lgpdTimestamp,
    role: isAdminUser(user) ? 'admin' : 'client',
  }
}
