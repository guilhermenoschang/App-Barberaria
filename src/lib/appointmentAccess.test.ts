import { describe, expect, it } from 'vitest'
import { appointmentBelongsToUser, bindAppointmentOwner, normalizeAppointmentOwnership } from '@/lib/appointmentAccess'
import type { Appointment, SessionUser } from '@/types'

const user: SessionUser = {
  id: 'user_1',
  name: 'Cliente Teste',
  phone: '(11) 99999-0000',
  email: 'cliente@teste.com',
  lgpdAccepted: true,
  role: 'client',
}

const appointment: Appointment = {
  id: 'appt_1',
  clientName: 'Cliente Teste',
  clientPhone: '(11) 99999-0000',
  serviceId: 'svc_1',
  serviceName: 'Corte',
  servicePrice: 40,
  barberId: 'barber_1',
  barberName: 'Joao',
  date: '2026-05-15',
  time: '10:00',
  status: 'confirmed',
  lgpdConsent: true,
  createdAt: '2026-05-15T10:00:00.000Z',
}

describe('appointment ownership', () => {
  it('binds the appointment to the authenticated client', () => {
    expect(bindAppointmentOwner(appointment, user)).toMatchObject({
      ownerUserId: 'user_1',
      ownerEmail: 'cliente@teste.com',
      clientEmail: 'cliente@teste.com',
      sessionId: 'user_1',
    })
  })

  it('normalizes legacy appointments and matches them to the right user', () => {
    const legacy = normalizeAppointmentOwnership({
      ...appointment,
      clientEmail: 'CLIENTE@TESTE.COM',
      sessionId: 'user_1',
    })

    expect(legacy.ownerUserId).toBe('user_1')
    expect(legacy.ownerEmail).toBe('cliente@teste.com')
    expect(appointmentBelongsToUser(legacy, user)).toBe(true)
    expect(appointmentBelongsToUser({ ...legacy, ownerUserId: 'other_user' }, user)).toBe(false)
  })
})
