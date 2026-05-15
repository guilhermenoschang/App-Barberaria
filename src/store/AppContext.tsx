import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  Barber, Service, Appointment, WeekSchedule, Holiday,
  BlockedSlot, BarberiaConfig, SessionUser, Notification, Theme
} from '@/types'
import { todayStr } from '@/lib/dates'
import { supabase } from '@/lib/supabaseClient'
import { isAdminUser, mapSupabaseUser } from '@/lib/auth'
import { appointmentBelongsToUser, bindAppointmentOwner, normalizeAppointmentOwnership } from '@/lib/appointmentAccess'
import {
  fetchAppointments,
  fetchBarbers,
  fetchBlockedSlots,
  fetchConfig,
  fetchHolidays,
  fetchSchedule,
  fetchServices,
  persistAppointment,
  persistAppointmentStatus,
  persistBarber,
  persistConfig,
  persistSchedule,
  persistService,
  replaceBlockedSlots,
  replaceHolidays,
} from '@/lib/supabaseData'

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

type AuthResult = { ok: boolean; error?: string }

interface RegisterClientInput {
  name: string
  phone: string
  email: string
  password: string
  lgpdAccepted: boolean
  lgpdTimestamp: string
}

interface LoginClientInput {
  email: string
  password: string
}

interface UpdateProfileInput {
  name: string
  phone: string
  email?: string
}

interface AppCtx {
  barbers: Barber[]; services: Service[]; appointments: Appointment[]
  schedule: WeekSchedule; holidays: Holiday[]; blockedSlots: BlockedSlot[]
  config: BarberiaConfig; notifications: Notification[]
  sessionUser: SessionUser | null; isAdmin: boolean; authLoading: boolean
  theme: Theme
  setBarbers: (b: Barber[]) => void
  addBarber: (b: Barber) => void
  updateBarber: (b: Barber) => void
  setServices: (s: Service[]) => void
  addService: (s: Service) => void
  updateService: (s: Service) => void
  addAppointment: (a: Appointment) => void
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void
  cancelOwnAppointment: (id: string) => AuthResult
  updateAppointment: (a: Appointment) => void
  setSchedule: (s: WeekSchedule) => void
  setHolidays: (h: Holiday[]) => void
  setBlockedSlots: (b: BlockedSlot[]) => void
  setConfig: (c: BarberiaConfig) => void
  loginAsAdmin: (input: LoginClientInput) => Promise<AuthResult>
  loginAsClient: (input: LoginClientInput) => Promise<AuthResult>
  registerClient: (input: RegisterClientInput) => Promise<AuthResult>
  updateProfile: (input: UpdateProfileInput) => Promise<AuthResult>
  logout: () => Promise<void>
  setTheme: (t: Theme) => void
  addNotification: (n: Omit<Notification,'id'|'timestamp'|'read'>) => void
  markNotifRead: (id: string) => void
}

const Ctx = createContext<AppCtx>(null!)
export const useApp = () => useContext(Ctx)

function normalizeErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message
  }
  return fallback
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [barbers, setBarbersState] = useState<Barber[]>(MOCK_BARBERS)
  const [services, setServicesState] = useState<Service[]>(MOCK_SERVICES)
  const [appointments, setAppointmentsState] = useState<Appointment[]>(MOCK_APPOINTMENTS.map(normalizeAppointmentOwnership))
  const [schedule, setScheduleState] = useState<WeekSchedule>(MOCK_SCHEDULE)
  const [holidays, setHolidaysState] = useState<Holiday[]>(MOCK_HOLIDAYS)
  const [blockedSlots, setBlockedSlotsState] = useState<BlockedSlot[]>([])
  const [config, setConfigState] = useState<BarberiaConfig>(MOCK_CONFIG)
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [theme, setTheme] = useState<Theme>('dark')
  const [notifications, setNotifications] = useState<Notification[]>([])

  const syncSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      const user = data.session?.user ?? null
      if (!user) {
        setSessionUser(null)
        setIsAdmin(false)
        return
      }

      setSessionUser(mapSupabaseUser(user))
      setIsAdmin(isAdminUser(user))
    } catch {
      setSessionUser(null)
      setIsAdmin(false)
    } finally {
      setAuthLoading(false)
    }
  }, [])

  useEffect(() => {
    syncSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      if (!user) {
        setSessionUser(null)
        setIsAdmin(false)
        setAuthLoading(false)
        return
      }

      setSessionUser(mapSupabaseUser(user))
      setIsAdmin(isAdminUser(user))
      setAuthLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [syncSession])

  const addNotification = useCallback((n: Omit<Notification,'id'|'timestamp'|'read'>) => {
    const notif: Notification = { ...n, id: Date.now().toString(), timestamp: new Date().toISOString(), read: false }
    setNotifications(prev => [notif, ...prev].slice(0, 50))
  }, [])

  const reportSyncError = useCallback((action: string, error: unknown) => {
    console.error(`Falha ao sincronizar ${action} com Supabase.`, error)
    addNotification({
      message: `Falha ao sincronizar ${action} com o Supabase. Revise as tabelas e permissões.`,
      type: 'warning',
    })
  }, [addNotification])

  const markNotifRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  useEffect(() => {
    let active = true

    async function syncData() {
      try {
        const [remoteBarbers, remoteServices, remoteAppointments, remoteSchedule, remoteHolidays, remoteBlockedSlots, remoteConfig] = await Promise.all([
          fetchBarbers(),
          fetchServices(),
          fetchAppointments(),
          fetchSchedule(),
          fetchHolidays(),
          fetchBlockedSlots(),
          fetchConfig(),
        ])

        if (!active) return

        if (remoteBarbers.length) setBarbersState(remoteBarbers)
        if (remoteServices.length) setServicesState(remoteServices)
        if (remoteAppointments.length) setAppointmentsState(remoteAppointments.map(normalizeAppointmentOwnership))
        if (remoteSchedule) setScheduleState(remoteSchedule)
        if (remoteHolidays.length) setHolidaysState(remoteHolidays)
        if (remoteBlockedSlots.length) setBlockedSlotsState(remoteBlockedSlots)
        if (remoteConfig) setConfigState(remoteConfig)
      } catch (error) {
        console.warn('Supabase indisponível para hidratar dados iniciais. Mantendo mocks locais.', error)
      }
    }

    syncData()
    return () => { active = false }
  }, [])

  const setBarbers = useCallback((next: Barber[]) => {
    setBarbersState(next)
    Promise.all(next.map(persistBarber)).catch(error => reportSyncError('barbeiros', error))
  }, [reportSyncError])

  const addBarber = useCallback((b: Barber) => {
    setBarbersState(prev => [...prev, b])
    persistBarber(b).catch(error => reportSyncError(`barbeiro ${b.name}`, error))
  }, [reportSyncError])

  const updateBarber = useCallback((b: Barber) => {
    setBarbersState(prev => prev.map(x => x.id === b.id ? b : x))
    persistBarber(b).catch(error => reportSyncError(`barbeiro ${b.name}`, error))
  }, [reportSyncError])

  const setServices = useCallback((next: Service[]) => {
    setServicesState(next)
    Promise.all(next.map(persistService)).catch(error => reportSyncError('serviços', error))
  }, [reportSyncError])

  const addService = useCallback((s: Service) => {
    setServicesState(prev => [...prev, s])
    persistService(s).catch(error => reportSyncError(`serviço ${s.name}`, error))
  }, [reportSyncError])

  const updateService = useCallback((s: Service) => {
    setServicesState(prev => prev.map(x => x.id === s.id ? s : x))
    persistService(s).catch(error => reportSyncError(`serviço ${s.name}`, error))
  }, [reportSyncError])

  const addAppointment = useCallback((a: Appointment) => {
    const nextAppointment = normalizeAppointmentOwnership(bindAppointmentOwner(a, sessionUser))
    setAppointmentsState(prev => [nextAppointment, ...prev])
    addNotification({ message: `Novo agendamento: ${a.clientName} — ${a.serviceName} com ${a.barberName} em ${a.date} às ${a.time}`, type: 'success' })
    persistAppointment(nextAppointment).catch(error => reportSyncError(`agendamento de ${nextAppointment.clientName}`, error))
  }, [addNotification, reportSyncError, sessionUser])

  const updateAppointmentStatus = useCallback((id: string, status: Appointment['status']) => {
    setAppointmentsState(prev => prev.map(a => {
      if (a.id !== id) return a
      if (status === 'cancelled') {
        addNotification({ message: `Agendamento de ${a.clientName} cancelado. Horário ${a.time} de ${a.barberName} liberado.`, type: 'warning' })
      }
      if (status === 'completed') {
        addNotification({ message: `Atendimento de ${a.clientName} concluído — ${a.serviceName}.`, type: 'info' })
      }
      return { ...a, status }
    }))
    persistAppointmentStatus(id, status).catch(error => reportSyncError(`status do agendamento ${id}`, error))
  }, [addNotification, reportSyncError])

  const updateAppointment = useCallback((a: Appointment) => {
    const normalized = normalizeAppointmentOwnership(a)
    setAppointmentsState(prev => prev.map(x => x.id === normalized.id ? normalized : x))
    persistAppointment(normalized).catch(error => reportSyncError(`agendamento ${normalized.id}`, error))
  }, [reportSyncError])

  const cancelOwnAppointment = useCallback((id: string): AuthResult => {
    const appointment = appointments.find(item => item.id === id)
    if (!appointment) return { ok: false, error: 'Agendamento nÃ£o encontrado.' }
    if (!appointmentBelongsToUser(appointment, sessionUser)) {
      return { ok: false, error: 'VocÃª nÃ£o tem permissÃ£o para cancelar este agendamento.' }
    }

    updateAppointmentStatus(id, 'cancelled')
    return { ok: true }
  }, [appointments, sessionUser, updateAppointmentStatus])

  const setSchedule = useCallback((next: WeekSchedule) => {
    setScheduleState(next)
    persistSchedule(next).catch(error => reportSyncError('grade semanal', error))
  }, [reportSyncError])

  const setHolidays = useCallback((next: Holiday[]) => {
    setHolidaysState(next)
    replaceHolidays(next).catch(error => reportSyncError('feriados', error))
  }, [reportSyncError])

  const setBlockedSlots = useCallback((next: BlockedSlot[]) => {
    setBlockedSlotsState(next)
    replaceBlockedSlots(next).catch(error => reportSyncError('bloqueios manuais', error))
  }, [reportSyncError])

  const setConfig = useCallback((next: BarberiaConfig) => {
    setConfigState(next)
    persistConfig(next).catch(error => reportSyncError('configurações', error))
  }, [reportSyncError])

  const loginAsClient = useCallback(async ({ email, password }: LoginClientInput): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (error) return { ok: false, error: error.message }
      if (!data.user) return { ok: false, error: 'Sessão não retornada pelo Supabase.' }
      if (isAdminUser(data.user)) return { ok: false, error: 'Use o login administrativo para esta conta.' }
      return { ok: true }
    } catch (error) {
      return { ok: false, error: normalizeErrorMessage(error, 'Falha ao autenticar cliente.') }
    }
  }, [])

  const loginAsAdmin = useCallback(async ({ email, password }: LoginClientInput): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (error) return { ok: false, error: error.message }
      if (!data.user || !isAdminUser(data.user)) {
        await supabase.auth.signOut()
        return { ok: false, error: 'Usuário sem permissão administrativa.' }
      }
      return { ok: true }
    } catch (error) {
      return { ok: false, error: normalizeErrorMessage(error, 'Falha ao autenticar administrador.') }
    }
  }, [])

  const registerClient = useCallback(async (input: RegisterClientInput): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.signUp({
        email: input.email.trim().toLowerCase(),
        password: input.password,
        options: {
          data: {
            name: input.name,
            phone: input.phone,
            lgpdAccepted: input.lgpdAccepted,
            lgpdTimestamp: input.lgpdTimestamp,
            role: 'client',
          },
        },
      })

      if (error) return { ok: false, error: error.message }
      return { ok: true }
    } catch (error) {
      return { ok: false, error: normalizeErrorMessage(error, 'Falha ao criar conta.') }
    }
  }, [])

  const updateProfile = useCallback(async (input: UpdateProfileInput): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.updateUser({
        email: input.email?.trim().toLowerCase(),
        data: {
          name: input.name,
          phone: input.phone,
        },
      })

      if (error) return { ok: false, error: error.message }
      return { ok: true }
    } catch (error) {
      return { ok: false, error: normalizeErrorMessage(error, 'Falha ao atualizar perfil.') }
    }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setSessionUser(null)
    setIsAdmin(false)
  }, [])

  const value: AppCtx = {
    barbers, services, appointments, schedule, holidays, blockedSlots, config, notifications,
    sessionUser, isAdmin, authLoading, theme,
    setBarbers, addBarber, updateBarber,
    setServices, addService, updateService,
    addAppointment, updateAppointmentStatus, cancelOwnAppointment, updateAppointment,
    setSchedule, setHolidays, setBlockedSlots,
    setConfig, loginAsAdmin, loginAsClient, registerClient, updateProfile, logout,
    setTheme, addNotification, markNotifRead,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
