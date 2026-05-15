export type Theme = 'dark' | 'gray' | 'light'
export type AppointmentStatus = 'confirmed' | 'cancelled' | 'completed'

export interface Barber {
  id: string; name: string; specialty: string; description: string
  photo?: string; whatsapp?: string; active: boolean
}
export interface Service {
  id: string; name: string; description: string
  price: number; durationMinutes: number; active: boolean
}
export interface Appointment {
  id: string; clientName: string; clientPhone: string
  clientEmail?: string; observation?: string
  ownerUserId?: string; ownerEmail?: string
  serviceId: string; serviceName: string; servicePrice: number
  barberId: string; barberName: string
  date: string   // YYYY-MM-DD — local, nunca UTC
  time: string   // HH:mm
  status: AppointmentStatus
  lgpdConsent: boolean; consentTimestamp?: string
  consentVersion?: string; consentOrigin?: string; createdAt: string
  sessionId?: string  // para isolar agendamentos por sessão no MVP
}
export interface DaySchedule { open: boolean; openTime: string; closeTime: string }
export type WeekSchedule = Record<string, DaySchedule>
export interface Holiday {
  id: string; date: string; name: string
  type: 'closed' | 'reduced'; openTime?: string; closeTime?: string
}
export interface BlockedSlot { id: string; barberId: string; date: string; time: string; reason?: string }
export interface BarberiaConfig {
  name: string; tagline: string; address: string; whatsapp: string
  instagram?: string; scheduleText: string; heroText: string
  whatsappButtonText: string; intervalMinutes: number
}
export interface SessionUser {
  id: string; name: string; phone: string; email?: string
  lgpdAccepted: boolean; lgpdTimestamp?: string
  role: 'client' | 'admin'
}
export interface Notification {
  id: string; message: string; type: 'success'|'warning'|'info'; timestamp: string; read: boolean
}
