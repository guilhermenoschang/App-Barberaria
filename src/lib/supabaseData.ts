import { supabase } from '@/lib/supabaseClient'
import type {
  Appointment,
  Barber,
  BarberiaConfig,
  BlockedSlot,
  Holiday,
  Service,
  WeekSchedule,
} from '@/types'

type ScheduleRow = {
  day_key: string
  open: boolean
  open_time: string
  close_time: string
}

type ConfigRow = BarberiaConfig & {
  id: string
}

const CONFIG_ID = 'main'

function ensureArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

export async function fetchBarbers(): Promise<Barber[]> {
  const { data, error } = await supabase.from('barbers').select('*').order('name')
  if (error) throw error
  return ensureArray(data as Barber[] | null)
}

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase.from('services').select('*').order('name')
  if (error) throw error
  return ensureArray(data as Service[] | null)
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase.from('appointments').select('*').order('date').order('time')
  if (error) throw error
  return ensureArray(data as Appointment[] | null)
}

export async function fetchHolidays(): Promise<Holiday[]> {
  const { data, error } = await supabase.from('holidays').select('*').order('date')
  if (error) throw error
  return ensureArray(data as Holiday[] | null)
}

export async function fetchBlockedSlots(): Promise<BlockedSlot[]> {
  const { data, error } = await supabase.from('blocked_slots').select('*').order('date').order('time')
  if (error) throw error
  return ensureArray(data as BlockedSlot[] | null)
}

export async function fetchSchedule(): Promise<WeekSchedule | null> {
  const { data, error } = await supabase.from('schedule').select('*')
  if (error) throw error

  const rows = ensureArray(data as ScheduleRow[] | null)
  if (rows.length === 0) return null

  return rows.reduce<WeekSchedule>((acc, row) => {
    acc[row.day_key] = {
      open: row.open,
      openTime: row.open_time,
      closeTime: row.close_time,
    }
    return acc
  }, {})
}

export async function fetchConfig(): Promise<BarberiaConfig | null> {
  const { data, error } = await supabase.from('config').select('*').eq('id', CONFIG_ID).maybeSingle()
  if (error) throw error
  if (!data) return null

  const { id: _id, ...config } = data as ConfigRow
  return config
}

export async function persistBarber(barber: Barber): Promise<void> {
  const { error } = await supabase.from('barbers').upsert(barber, { onConflict: 'id' })
  if (error) throw error
}

export async function persistService(service: Service): Promise<void> {
  const { error } = await supabase.from('services').upsert(service, { onConflict: 'id' })
  if (error) throw error
}

export async function persistAppointment(appointment: Appointment): Promise<void> {
  const { error } = await supabase.from('appointments').upsert(appointment, { onConflict: 'id' })
  if (error) throw error
}

export async function persistAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
  if (error) throw error
}

export async function persistSchedule(schedule: WeekSchedule): Promise<void> {
  const rows = Object.entries(schedule).map(([dayKey, value]) => ({
    day_key: dayKey,
    open: value.open,
    open_time: value.openTime,
    close_time: value.closeTime,
  }))

  const { error } = await supabase.from('schedule').upsert(rows, { onConflict: 'day_key' })
  if (error) throw error
}

export async function replaceHolidays(holidays: Holiday[]): Promise<void> {
  const { error: deleteError } = await supabase.from('holidays').delete().not('id', 'is', null)
  if (deleteError) throw deleteError
  if (holidays.length === 0) return
  const { error } = await supabase.from('holidays').insert(holidays)
  if (error) throw error
}

export async function replaceBlockedSlots(blockedSlots: BlockedSlot[]): Promise<void> {
  const { error: deleteError } = await supabase.from('blocked_slots').delete().not('id', 'is', null)
  if (deleteError) throw deleteError
  if (blockedSlots.length === 0) return
  const { error } = await supabase.from('blocked_slots').insert(blockedSlots)
  if (error) throw error
}

export async function persistConfig(config: BarberiaConfig): Promise<void> {
  const payload: ConfigRow = { id: CONFIG_ID, ...config }
  const { error } = await supabase.from('config').upsert(payload, { onConflict: 'id' })
  if (error) throw error
}
