import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  Barber, Service, Appointment, WeekSchedule, Holiday,
  BlockedSlot, BarberiaConfig, SessionUser, Notification, Theme
} from '@/types'
import { todayStr, localDateStr } from '@/lib/dates'

/* ── MOCK INITIAL DATA ─────────────────────────────────────────────────────── */
const MOCK_BARBERS: Barber[] = [
  { id:'b1', name:'João Silva', specialty:'Degradê & Skin Fade', description:'8 anos de experiência. Especialista em degradê americano, skin fade e tesoura.', active:true },
  { id:'b2', name:'Marcos Oliveira', specialty:'Corte Clássico & Barba', description:'12 anos de ofício. Mestre na navalha, barbas longas e estilo clássico.', active:true },
  { id:'b3', name:'Rafael Santos', specialty:'Freestyle & Cortes Modernos', description:'5 anos. Especialista em desenhos artísticos, pompadour e cortes contemporâneos.', active:true },
]
const MOCK_SERVICES: Service[] = [
  { id:'s1', name:'Corte Masculino', description:'Corte personalizado com tesoura ou máquina, acabamento na navalha.', price:40, durationMinutes:45, active:true },
  { id:'s2', name:'Barba', description:'Modelagem com navalha, toalha quente e hidratação pós-barba.', price:30, durationMinutes:30, active:true },
  { id:'s3', name:'Corte + Barba', description:'O combo completo. Corte + barba na navalha. Saída impecável.', price:65, durationMinutes:75, active:true },
  { id:'s4', name:'Sobrancelha', description:'Design masculino da sobrancelha com alinhamento profissional.', price:15, durationMinutes:15, active:true },
  { id:'s5', name:'Acabamento', description:'Pezinho, lateral e finalização para manter o corte sempre em dia.', price:20, durationMinutes:20, active:true },
]
const today = todayStr()
const MOCK_APPOINTMENTS: Appointment[] = [
  { id:'a1', clientName:'Carlos Mendes', clientPhone:'(11) 98888-1111', clientEmail:'carlos@email.com', serviceId:'s1', serviceName:'Corte Masculino', servicePrice:40, barberId:'b1', barberName:'João Silva', date:today, time:'09:00', status:'confirmed', lgpdConsent:true, consentTimestamp:'2025-01-15T10:32:00', consentVersion:'v1.0', consentOrigin:'agendamento', createdAt:'2025-01-15T10:32:00' },
  { id:'a2', clientName:'André Pereira', clientPhone:'(11) 97777-2222', serviceId:'s2', serviceName:'Barba', servicePrice:30, barberId:'b2', barberName:'Marcos Oliveira', date:today, time:'10:00', status:'confirmed', lgpdConsent:true, consentTimestamp:'2025-02-20T09:00:00', consentVersion:'v1.0', consentOrigin:'agendamento', createdAt:'2025-02-20T09:00:00' },
  { id:'a3', clientName:'Bruno Tavares', clientPhone:'(11) 96666-3333', serviceId:'s3', serviceName:'Corte + Barba', servicePrice:65, barberId:'b3', barberName:'Rafael Santos', date:today, time:'11:00', status:'confirmed', lgpdConsent:true, consentTimestamp:'2025-03-10T14:00:00', consentVersion:'v1.0', consentOrigin:'agendamento', createdAt:'2025-03-10T14:00:00' },
  { id:'a4', clientName:'Diego Rocha', clientPhone:'(11) 95555-4444', serviceId:'s4', serviceName:'Sobrancelha', servicePrice:15, barberId:'b1', barberName:'João Silva', date:today, time:'14:00', status:'confirmed', lgpdConsent:false, createdAt:'2025-04-01T08:00:00' },
]
const MOCK_SCHEDULE: WeekSchedule = {
  monday:    { open:true,  openTime:'09:00', closeTime:'20:00' },
  tuesday:   { open:true,  openTime:'09:00', closeTime:'20:00' },
  wednesday: { open:true,  openTime:'09:00', closeTime:'20:00' },
  thursday:  { open:true,  openTime:'09:00', closeTime:'20:00' },
  friday:    { open:true,  openTime:'09:00', closeTime:'20:00' },
  saturday:  { open:true,  openTime:'09:00', closeTime:'18:00' },
  sunday:    { open:false, openTime:'09:00', closeTime:'18:00' },
}
const MOCK_HOLIDAYS: Holiday[] = [
  { id:'h1', date:'2025-09-07', name:'Independência', type:'reduced', openTime:'10:00', closeTime:'16:00' },
  { id:'h2', date:'2025-11-15', name:'Proclamação da República', type:'closed' },
  { id:'h3', date:'2026-01-01', name:'Ano Novo', type:'closed' },
]
const MOCK_CONFIG: BarberiaConfig = {
  name:'Barbearia Prime', tagline:'Onde o estilo encontra a tradição.',
  address:'Rua das Tesouras, 247 — Centro, São Paulo SP',
  whatsapp:'5511999990000', instagram:'@barbeariaprime',
  scheduleText:'Seg–Sex: 9h–20h · Sáb: 9h–18h · Dom: Fechado',
  heroText:'Experimente o padrão mais alto em cuidados masculinos. Agende agora e saia impecável.',
  whatsappButtonText:'Falar no WhatsApp', intervalMinutes:60,
}

/* ── CONTEXT TYPES ─────────────────────────────────────────────────────────── */
interface AppCtx {
  // Data
  barbers: Barber[]; services: Service[]; appointments: Appointment[]
  schedule: WeekSchedule; holidays: Holiday[]; blockedSlots: BlockedSlot[]
  config: BarberiaConfig; notifications: Notification[]
  // Auth
  sessionUser: SessionUser | null; isAdmin: boolean
  // Theme
  theme: Theme
  // Barbers
  setBarbers: (b: Barber[]) => void
  addBarber: (b: Barber) => void
  updateBarber: (b: Barber) => void
  // Services
  setServices: (s: Service[]) => void
  addService: (s: Service) => void
  updateService: (s: Service) => void
  // Appointments
  addAppointment: (a: Appointment) => void
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void
  updateAppointment: (a: Appointment) => void
  // Schedule
  setSchedule: (s: WeekSchedule) => void
  setHolidays: (h: Holiday[]) => void
  setBlockedSlots: (b: BlockedSlot[]) => void
  // Config
  setConfig: (c: BarberiaConfig) => void
  // Auth
  loginAsAdmin: () => void
  loginAsClient: (u: SessionUser) => void
  logout: () => void
  // Theme
  setTheme: (t: Theme) => void
  // Notifications
  addNotification: (n: Omit<Notification,'id'|'timestamp'|'read'>) => void
  markNotifRead: (id: string) => void
}

const Ctx = createContext<AppCtx>(null!)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [barbers, setBarbers] = useState<Barber[]>(MOCK_BARBERS)
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES)
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS)
  const [schedule, setSchedule] = useState<WeekSchedule>(MOCK_SCHEDULE)
  const [holidays, setHolidays] = useState<Holiday[]>(MOCK_HOLIDAYS)
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [config, setConfig] = useState<BarberiaConfig>(MOCK_CONFIG)
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((n: Omit<Notification,'id'|'timestamp'|'read'>) => {
    const notif: Notification = { ...n, id: Date.now().toString(), timestamp: new Date().toISOString(), read: false }
    setNotifications(prev => [notif, ...prev].slice(0, 50))
  }, [])

  const markNotifRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const addBarber = (b: Barber) => setBarbers(prev => [...prev, b])
  const updateBarber = (b: Barber) => setBarbers(prev => prev.map(x => x.id === b.id ? b : x))
  const addService = (s: Service) => setServices(prev => [...prev, s])
  const updateService = (s: Service) => setServices(prev => prev.map(x => x.id === s.id ? s : x))

  const addAppointment = useCallback((a: Appointment) => {
    setAppointments(prev => [a, ...prev])
    addNotification({ message: `Novo agendamento: ${a.clientName} — ${a.serviceName} com ${a.barberName} em ${a.date} às ${a.time}`, type: 'success' })
  }, [addNotification])

  const updateAppointmentStatus = useCallback((id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => {
      if (a.id !== id) return a
      if (status === 'cancelled') {
        addNotification({ message: `Agendamento de ${a.clientName} cancelado. Horário ${a.time} de ${a.barberName} liberado.`, type: 'warning' })
      }
      if (status === 'completed') {
        addNotification({ message: `Atendimento de ${a.clientName} concluído — ${a.serviceName}.`, type: 'info' })
      }
      return { ...a, status }
    }))
  }, [addNotification])

  const updateAppointment = (a: Appointment) => setAppointments(prev => prev.map(x => x.id === a.id ? a : x))

  const loginAsAdmin = () => { setIsAdmin(true); setSessionUser(null) }
  const loginAsClient = (u: SessionUser) => { setSessionUser(u); setIsAdmin(false) }
  const logout = () => { setSessionUser(null); setIsAdmin(false) }

  const value: AppCtx = {
    barbers, services, appointments, schedule, holidays, blockedSlots, config, notifications,
    sessionUser, isAdmin, theme,
    setBarbers, addBarber, updateBarber,
    setServices, addService, updateService,
    addAppointment, updateAppointmentStatus, updateAppointment,
    setSchedule, setHolidays, setBlockedSlots: (b) => setBlockedSlots(b),
    setConfig, loginAsAdmin, loginAsClient, logout,
    setTheme, addNotification, markNotifRead,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
