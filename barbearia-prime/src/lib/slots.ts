import { Appointment, Holiday, BlockedSlot, WeekSchedule } from '@/types'
import { weekdayKey } from './dates'

export function generateTimeSlots(openTime: string, closeTime: string, intervalMin: number): string[] {
  const slots: string[] = []
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  let cur = oh * 60 + om
  const end = ch * 60 + cm
  while (cur < end) {
    slots.push(`${String(Math.floor(cur/60)).padStart(2,'0')}:${String(cur%60).padStart(2,'0')}`)
    cur += intervalMin
  }
  return slots
}

export interface SlotResult {
  slots: string[]
  holidayInfo?: Holiday
  isClosed: boolean
}

export function getAvailableSlots(
  date: string,
  barberId: string,
  appointments: Appointment[],
  schedule: WeekSchedule,
  holidays: Holiday[],
  blockedSlots: BlockedSlot[],
  intervalMin: number
): SlotResult {
  // Check holiday
  const holiday = holidays.find(h => h.date === date)
  if (holiday?.type === 'closed') return { slots: [], holidayInfo: holiday, isClosed: true }

  // Check weekday
  const dayKey = weekdayKey(date)
  const daySched = schedule[dayKey]
  if (!daySched?.open) return { slots: [], isClosed: true }

  let openTime = daySched.openTime
  let closeTime = daySched.closeTime
  if (holiday?.type === 'reduced' && holiday.openTime && holiday.closeTime) {
    openTime = holiday.openTime
    closeTime = holiday.closeTime
  }

  const all = generateTimeSlots(openTime, closeTime, intervalMin)

  // Filter taken: same barberId + same date + confirmed/pending
  const taken = new Set(
    appointments
      .filter(a => a.barberId === barberId && a.date === date && a.status !== 'cancelled')
      .map(a => a.time)
  )

  // Filter blocked
  const blocked = new Set(
    blockedSlots
      .filter(b => b.barberId === barberId && b.date === date)
      .map(b => b.time)
  )

  const available = all.filter(s => !taken.has(s) && !blocked.has(s))
  return { slots: available, holidayInfo: holiday ?? undefined, isClosed: false }
}

/** Check if a specific slot is free for a barberId+date (used before confirming) */
export function isSlotFree(
  date: string, time: string, barberId: string,
  appointments: Appointment[], blockedSlots: BlockedSlot[],
  excludeId?: string
): boolean {
  const taken = appointments.some(
    a => a.barberId === barberId && a.date === date && a.time === time
      && a.status !== 'cancelled' && a.id !== excludeId
  )
  const blocked = blockedSlots.some(b => b.barberId === barberId && b.date === date && b.time === time)
  return !taken && !blocked
}
