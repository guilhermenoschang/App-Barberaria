import { Appointment, BlockedSlot, Holiday, Service, WeekSchedule } from '@/types'
import { weekdayKey } from './dates'

export interface SlotResult {
  slots: string[]
  holidayInfo?: Holiday
  isClosed: boolean
}

export interface SlotValidationResult {
  ok: boolean
  reason?: 'holiday_closed' | 'day_closed' | 'outside_hours' | 'blocked' | 'conflict'
  holidayInfo?: Holiday
}

export interface BlockRangeValidationResult {
  ok: boolean
  error?: string
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function overlaps(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && startB < endA
}

function resolveAppointmentDuration(
  appointment: Appointment,
  services: Service[],
  fallbackMinutes: number
): number {
  return services.find(service => service.id === appointment.serviceId)?.durationMinutes ?? fallbackMinutes
}

function resolveScheduleWindow(
  date: string,
  schedule: WeekSchedule,
  holidays: Holiday[]
): { isClosed: boolean; holidayInfo?: Holiday; openTime?: string; closeTime?: string } {
  const holiday = holidays.find(item => item.date === date)
  if (holiday?.type === 'closed') {
    return { isClosed: true, holidayInfo: holiday }
  }

  const dayKey = weekdayKey(date)
  const daySchedule = schedule[dayKey]
  if (!daySchedule?.open) {
    return { isClosed: true, holidayInfo: holiday }
  }

  if (holiday?.type === 'reduced' && holiday.openTime && holiday.closeTime) {
    return {
      isClosed: false,
      holidayInfo: holiday,
      openTime: holiday.openTime,
      closeTime: holiday.closeTime,
    }
  }

  return {
    isClosed: false,
    holidayInfo: holiday,
    openTime: daySchedule.openTime,
    closeTime: daySchedule.closeTime,
  }
}

export function generateTimeSlots(openTime: string, closeTime: string, intervalMin: number, durationMinutes = intervalMin): string[] {
  const slots: string[] = []
  let current = toMinutes(openTime)
  const end = toMinutes(closeTime)

  while (current + durationMinutes <= end) {
    slots.push(`${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`)
    current += intervalMin
  }

  return slots
}

export function generateBlockedTimeRange(startTime: string, endTime: string, intervalMin: number): string[] {
  const slots: string[] = []
  let current = toMinutes(startTime)
  const end = toMinutes(endTime)

  while (current < end) {
    slots.push(`${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`)
    current += intervalMin
  }

  return slots
}

export function validateBlockedTimeRange(startTime: string, endTime: string, intervalMin: number): BlockRangeValidationResult {
  if (!startTime || !endTime) return { ok: false, error: 'Informe horario inicial e final.' }
  if (toMinutes(endTime) <= toMinutes(startTime)) {
    return { ok: false, error: 'O horario final precisa ser maior que o inicial.' }
  }

  const slots = generateBlockedTimeRange(startTime, endTime, intervalMin)
  if (slots.length === 0) {
    return { ok: false, error: 'O intervalo precisa gerar pelo menos um horario bloqueado.' }
  }

  return { ok: true }
}

export function validateAppointmentSlot(
  date: string,
  time: string,
  barberId: string,
  durationMinutes: number,
  appointments: Appointment[],
  services: Service[],
  schedule: WeekSchedule,
  holidays: Holiday[],
  blockedSlots: BlockedSlot[],
  intervalMin: number,
  excludeAppointmentId?: string
): SlotValidationResult {
  const window = resolveScheduleWindow(date, schedule, holidays)
  if (window.isClosed || !window.openTime || !window.closeTime) {
    return {
      ok: false,
      reason: window.holidayInfo?.type === 'closed' ? 'holiday_closed' : 'day_closed',
      holidayInfo: window.holidayInfo,
    }
  }

  const slotStart = toMinutes(time)
  const slotEnd = slotStart + durationMinutes
  const openMinutes = toMinutes(window.openTime)
  const closeMinutes = toMinutes(window.closeTime)

  if (slotStart < openMinutes || slotEnd > closeMinutes) {
    return { ok: false, reason: 'outside_hours', holidayInfo: window.holidayInfo }
  }

  const hasBlockedOverlap = blockedSlots.some(blocked => {
    if (blocked.barberId !== barberId || blocked.date !== date) return false
    const blockedStart = toMinutes(blocked.time)
    const blockedEnd = blockedStart + intervalMin
    return overlaps(slotStart, slotEnd, blockedStart, blockedEnd)
  })
  if (hasBlockedOverlap) {
    return { ok: false, reason: 'blocked', holidayInfo: window.holidayInfo }
  }

  const hasAppointmentConflict = appointments.some(appointment => {
    if (appointment.id === excludeAppointmentId) return false
    if (appointment.barberId !== barberId || appointment.date !== date) return false
    if (appointment.status === 'cancelled') return false

    const appointmentStart = toMinutes(appointment.time)
    const appointmentEnd = appointmentStart + resolveAppointmentDuration(appointment, services, intervalMin)
    return overlaps(slotStart, slotEnd, appointmentStart, appointmentEnd)
  })
  if (hasAppointmentConflict) {
    return { ok: false, reason: 'conflict', holidayInfo: window.holidayInfo }
  }

  return { ok: true, holidayInfo: window.holidayInfo }
}

export function getAvailableSlots(
  date: string,
  barberId: string,
  appointments: Appointment[],
  services: Service[],
  schedule: WeekSchedule,
  holidays: Holiday[],
  blockedSlots: BlockedSlot[],
  intervalMin: number,
  durationMinutes = intervalMin,
  excludeAppointmentId?: string
): SlotResult {
  const window = resolveScheduleWindow(date, schedule, holidays)
  if (window.isClosed || !window.openTime || !window.closeTime) {
    return { slots: [], holidayInfo: window.holidayInfo, isClosed: true }
  }

  const candidates = generateTimeSlots(window.openTime, window.closeTime, intervalMin, durationMinutes)
  const slots = candidates.filter(time =>
    validateAppointmentSlot(
      date,
      time,
      barberId,
      durationMinutes,
      appointments,
      services,
      schedule,
      holidays,
      blockedSlots,
      intervalMin,
      excludeAppointmentId
    ).ok
  )

  return { slots, holidayInfo: window.holidayInfo, isClosed: false }
}

export function isSlotFree(
  date: string,
  time: string,
  barberId: string,
  durationMinutes: number,
  appointments: Appointment[],
  services: Service[],
  schedule: WeekSchedule,
  holidays: Holiday[],
  blockedSlots: BlockedSlot[],
  intervalMin: number,
  excludeAppointmentId?: string
): boolean {
  return validateAppointmentSlot(
    date,
    time,
    barberId,
    durationMinutes,
    appointments,
    services,
    schedule,
    holidays,
    blockedSlots,
    intervalMin,
    excludeAppointmentId
  ).ok
}
