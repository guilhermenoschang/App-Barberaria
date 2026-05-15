import type { Appointment, SessionUser } from '@/types'

export function normalizeEmail(email?: string): string | undefined {
  const trimmed = email?.trim().toLowerCase()
  return trimmed || undefined
}

export function bindAppointmentOwner(appointment: Appointment, user?: SessionUser | null): Appointment {
  if (!user || user.role !== 'client') return appointment

  return {
    ...appointment,
    ownerUserId: user.id,
    ownerEmail: normalizeEmail(user.email),
    clientEmail: normalizeEmail(user.email) ?? appointment.clientEmail,
    sessionId: user.id,
  }
}

export function normalizeAppointmentOwnership(appointment: Appointment): Appointment {
  const normalizedOwnerEmail = normalizeEmail(appointment.ownerEmail)
  const normalizedClientEmail = normalizeEmail(appointment.clientEmail)

  return {
    ...appointment,
    ownerUserId: appointment.ownerUserId ?? appointment.sessionId,
    ownerEmail: normalizedOwnerEmail ?? normalizedClientEmail,
    clientEmail: normalizedClientEmail,
  }
}

export function appointmentBelongsToUser(appointment: Appointment, user?: SessionUser | null): boolean {
  if (!user || user.role !== 'client') return false

  if (appointment.ownerUserId) return appointment.ownerUserId === user.id

  const userEmail = normalizeEmail(user.email)
  if (!userEmail) return false

  return appointment.ownerEmail === userEmail || appointment.clientEmail === userEmail
}
