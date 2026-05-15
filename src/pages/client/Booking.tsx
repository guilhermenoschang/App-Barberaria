import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { Appointment } from '@/types'
import { getAvailableSlots, validateAppointmentSlot } from '@/lib/slots'
import { addDaysStr, formatDatePT, formatDateShort, todayStr } from '@/lib/dates'
import { sanitize, sanitizeEmail, sanitizePhone } from '@/lib/sanitize'
import { buildBookingMessage, openBarberiaWhatsApp } from '@/lib/whatsapp'

const STEPS = ['Servico', 'Barbeiro', 'Data & Hora', 'Seus Dados', 'Confirmar']
const POLICY_VERSION = 'v1.0'

export default function Booking() {
  const { services, barbers, appointments, schedule, holidays, blockedSlots, config, addAppointment, sessionUser, addNotification, isAdmin } = useApp()
  const nav = useNavigate()

  const [step, setStep] = useState(0)
  const [selectedService, setSelectedService] = useState('')
  const [selectedBarber, setSelectedBarber] = useState('')
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [selectedTime, setSelectedTime] = useState('')
  const [form, setForm] = useState({
    name: sessionUser?.name || '',
    phone: sessionUser?.phone || '',
    email: sessionUser?.email || '',
    observation: '',
  })
  const [lgpd, setLgpd] = useState(false)
  const [confirmed, setConfirmed] = useState<Appointment | null>(null)
  const [error, setError] = useState('')

  if (!sessionUser || isAdmin) {
    return (
      <div className="page-wrap" style={{ textAlign: 'center', paddingTop: 60 }}>
        <Calendar size={36} style={{ color: 'var(--t3)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Entre com sua conta para agendar</h2>
        <p style={{ color: 'var(--t2)', fontSize: 13, marginBottom: 20 }}>
          O agendamento agora exige autenticaÃ§Ã£o para que cada cliente veja e gerencie apenas os prÃ³prios dados.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-gold" onClick={() => nav('/login')}>Entrar</button>
          <button className="btn-ghost btn-sm" onClick={() => nav('/cadastro')}>Criar conta</button>
        </div>
      </div>
    )
  }

  const currentUser = sessionUser

  const svc = services.find(service => service.id === selectedService)
  const brb = barbers.find(barber => barber.id === selectedBarber)

  const slotResult = useMemo(() => {
    if (!selectedBarber) return { slots: [], isClosed: false }

    return getAvailableSlots(
      selectedDate,
      selectedBarber,
      appointments,
      services,
      schedule,
      holidays,
      blockedSlots,
      config.intervalMinutes,
      svc?.durationMinutes ?? config.intervalMinutes
    )
  }, [
    appointments,
    blockedSlots,
    config.intervalMinutes,
    holidays,
    schedule,
    selectedBarber,
    selectedDate,
    services,
    svc?.durationMinutes,
  ])

  function changeDate(newDate: string) {
    setSelectedDate(newDate)
    setSelectedTime('')
  }

  function navDate(offset: number) {
    changeDate(addDaysStr(selectedDate, offset))
  }

  function canNext(): boolean {
    if (step === 0) return !!selectedService
    if (step === 1) return !!selectedBarber
    if (step === 2) return !!selectedDate && !!selectedTime
    if (step === 3) return !!form.name.trim() && !!form.phone.trim() && lgpd
    return true
  }

  function handleConfirm() {
    if (!svc || !brb || !selectedDate || !selectedTime) return
    setError('')

    const validation = validateAppointmentSlot(
      selectedDate,
      selectedTime,
      selectedBarber,
      svc.durationMinutes,
      appointments,
      services,
      schedule,
      holidays,
      blockedSlots,
      config.intervalMinutes
    )

    if (!validation.ok) {
      setError('Este horario nao esta mais disponivel para o servico selecionado. Por favor, escolha outro.')
      setStep(2)
      setSelectedTime('')
      return
    }

    const appt: Appointment = {
      id: `ap_${Date.now()}`,
      clientName: sanitize(form.name),
      clientPhone: sanitizePhone(form.phone),
      clientEmail: currentUser.email ? sanitizeEmail(currentUser.email) : (form.email ? sanitizeEmail(form.email) : undefined),
      ownerUserId: currentUser.id,
      ownerEmail: currentUser.email ? sanitizeEmail(currentUser.email) : undefined,
      observation: form.observation ? sanitize(form.observation) : undefined,
      serviceId: svc.id,
      serviceName: svc.name,
      servicePrice: svc.price,
      barberId: brb.id,
      barberName: brb.name,
      date: selectedDate,
      time: selectedTime,
      status: 'confirmed',
      lgpdConsent: lgpd,
      consentTimestamp: new Date().toISOString(),
      consentVersion: POLICY_VERSION,
      consentOrigin: 'agendamento',
      createdAt: new Date().toISOString(),
      sessionId: currentUser.id,
    }

    addAppointment(appt)
    addNotification({
      message: `Agendamento confirmado para ${form.name} em ${formatDateShort(selectedDate)} as ${selectedTime}.`,
      type: 'info',
    })
    setConfirmed(appt)
  }

  if (confirmed) {
    const msg = buildBookingMessage({
      clientName: confirmed.clientName,
      serviceName: confirmed.serviceName,
      barberName: confirmed.barberName,
      date: formatDateShort(confirmed.date),
      time: confirmed.time,
      price: confirmed.servicePrice,
    })

    return (
      <div className="page-wrap" style={{ maxWidth: 520, textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(39,174,96,0.1)', border: '2px solid #2ECC71', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle2 size={30} color="#2ECC71" />
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 6, color: '#2ECC71' }}>Agendado com Sucesso!</h2>
        <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 24 }}>Seu horario foi confirmado automaticamente.</p>
        <div className="card" style={{ padding: 20, textAlign: 'left', marginBottom: 16 }}>
          {[
            ['Servico', confirmed.serviceName],
            ['Barbeiro', confirmed.barberName],
            ['Data', formatDatePT(confirmed.date)],
            ['Horario', confirmed.time],
            ['Valor', `R$ ${confirmed.servicePrice.toFixed(2)}`],
            ['Cliente', confirmed.clientName],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--brd)', fontSize: 13 }}>
              <span style={{ color: 'var(--t2)' }}>{label}</span>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(39,174,96,0.06)', border: '1px solid rgba(39,174,96,0.2)', borderRadius: 4, padding: '10px 14px', fontSize: 12, color: '#2ECC71', marginBottom: 20, textAlign: 'left' }}>
          Use o botao abaixo se quiser avisar a barbearia pelo WhatsApp. Este app nao envia lembretes automáticos no momento.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-gold" onClick={() => openBarberiaWhatsApp(config, msg)}>Confirmar no WhatsApp</button>
          <button className="btn-ghost btn-sm" onClick={() => nav('/meus-agendamentos')}>Meus Agendamentos</button>
          <button
            className="btn-ghost btn-sm"
            onClick={() => {
              setConfirmed(null)
              setStep(0)
              setSelectedService('')
              setSelectedBarber('')
              setSelectedDate(todayStr())
              setSelectedTime('')
              setForm({ name: '', phone: '', email: '', observation: '' })
              setLgpd(false)
            }}
          >
            Novo Agendamento
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrap" style={{ maxWidth: 640 }}>
      <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, marginBottom: 4 }}>Agendar Horario</h2>
      <p style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 20 }}>Siga os passos para reservar seu horario</p>

      <div style={{ display: 'flex', marginBottom: 24, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 1, background: 'var(--brd)' }} />
        {STEPS.map((stepLabel, index) => (
          <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                marginBottom: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 600,
                background: index < step ? '#2ECC71' : index === step ? 'var(--gold)' : 'var(--bg3)',
                border: `1px solid ${index < step ? '#2ECC71' : index === step ? 'var(--gold)' : 'var(--brd)'}`,
                color: index <= step ? (index === step ? '#080808' : '#fff') : 'var(--t3)',
              }}
            >
              {index < step ? 'OK' : index + 1}
            </div>
            <span style={{ fontSize: 10, color: index === step ? 'var(--gold)' : 'var(--t3)' }}>{stepLabel}</span>
          </div>
        ))}
      </div>

      {error && <div style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', color: '#E74C3C', padding: '10px 14px', borderRadius: 4, marginBottom: 14, fontSize: 12 }}>{error}</div>}

      {step === 0 && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13, color: 'var(--t2)', fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Escolha o servico</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 8 }}>
            {services.filter(service => service.active).map(service => (
              <div
                key={service.id}
                onClick={() => {
                  setSelectedService(service.id)
                  setSelectedTime('')
                }}
                style={{
                  padding: 14,
                  border: `1px solid ${selectedService === service.id ? 'var(--gold)' : 'var(--brd)'}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: selectedService === service.id ? 'rgba(201,168,76,0.08)' : 'var(--bg3)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{service.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gold)' }}>R$ {service.price}</div>
                <div style={{ fontSize: 10, color: 'var(--t3)' }}>{service.durationMinutes}min</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13, color: 'var(--t2)', fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Escolha o barbeiro</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
            {barbers.filter(barber => barber.active).map(barber => (
              <div
                key={barber.id}
                onClick={() => {
                  setSelectedBarber(barber.id)
                  setSelectedTime('')
                }}
                style={{
                  padding: 16,
                  border: `1px solid ${selectedBarber === barber.id ? 'var(--gold)' : 'var(--brd)'}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: selectedBarber === barber.id ? 'rgba(201,168,76,0.08)' : 'var(--bg3)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg5)', border: '1px solid var(--brd-g)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', overflow: 'hidden', fontSize: 18 }}>
                  {barber.photo ? <img src={barber.photo} alt={barber.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'B'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{barber.name}</div>
                <div style={{ fontSize: 10, color: 'var(--t2)' }}>{barber.specialty}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13, color: 'var(--t2)', fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Data e Horario</h3>

          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <button className="btn-ghost btn-sm" onClick={() => changeDate(todayStr())} style={{ fontSize: 11 }}>Hoje</button>
            <button className="btn-ghost btn-sm" onClick={() => changeDate(addDaysStr(todayStr(), 1))} style={{ fontSize: 11 }}>Amanha</button>
            <button className="btn-ghost btn-sm" onClick={() => navDate(-1)} disabled={selectedDate <= todayStr()} style={{ fontSize: 11 }}>
              <ChevronLeft size={12} /> Anterior
            </button>
            <button className="btn-ghost btn-sm" onClick={() => navDate(1)} style={{ fontSize: 11 }}>
              Proximo <ChevronRight size={12} />
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--t3)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Data</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="date"
                className="inp"
                value={selectedDate}
                min={todayStr()}
                onChange={event => {
                  if (event.target.value) changeDate(event.target.value)
                }}
                style={{ maxWidth: 180 }}
              />
              <span style={{ fontSize: 12, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} /> {formatDatePT(selectedDate)}
              </span>
            </div>
          </div>

          {slotResult.holidayInfo && (
            <div style={{ background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.25)', borderRadius: 4, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#E67E22' }}>
              {slotResult.holidayInfo.name}
              {slotResult.holidayInfo.type === 'reduced' && ` - Horario reduzido: ${slotResult.holidayInfo.openTime}-${slotResult.holidayInfo.closeTime}`}
              {slotResult.holidayInfo.type === 'closed' && ' - Fechado'}
            </div>
          )}

          {slotResult.isClosed ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>
              Sem atendimento neste dia. Escolha outra data.
            </div>
          ) : slotResult.slots.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>
              Nenhum horario disponivel para este barbeiro nesta data.
            </div>
          ) : (
            <>
              <label style={{ fontSize: 11, color: 'var(--t3)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Horarios disponiveis</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(70px,1fr))', gap: 6 }}>
                {slotResult.slots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    style={{
                      padding: '8px 4px',
                      border: `1px solid ${selectedTime === slot ? 'var(--gold)' : 'var(--brd)'}`,
                      borderRadius: 4,
                      background: selectedTime === slot ? 'rgba(201,168,76,0.12)' : 'var(--bg3)',
                      color: selectedTime === slot ? 'var(--gold)' : 'var(--t1)',
                      fontSize: 13,
                      cursor: 'pointer',
                      fontWeight: selectedTime === slot ? 600 : 400,
                      transition: 'all 0.15s',
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13, color: 'var(--t2)', fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Seus Dados</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="lbl" style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>Nome completo *</label>
              <input className="inp" value={form.name} maxLength={60} onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))} placeholder="Seu nome" />
            </div>
            <div>
              <label className="lbl" style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>WhatsApp *</label>
              <input className="inp" value={form.phone} maxLength={20} onChange={event => setForm(prev => ({ ...prev, phone: event.target.value }))} placeholder="(11) 99999-0000" type="tel" />
            </div>
            <div>
              <label className="lbl" style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>E-mail da conta</label>
              <input className="inp" value={form.email} maxLength={100} onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))} placeholder="seu@email.com" type="email" readOnly={!!sessionUser.email} />
              {sessionUser.email && (
                <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>
                  Este e-mail identifica a propriedade do agendamento e vem da sua conta autenticada.
                </div>
              )}
            </div>
            <div>
              <label className="lbl" style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>Observacao (opcional)</label>
              <textarea className="inp" value={form.observation} maxLength={200} onChange={event => setForm(prev => ({ ...prev, observation: event.target.value }))} rows={2} style={{ resize: 'vertical' }} placeholder="Alguma preferencia ou detalhe..." />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px', background: 'var(--bg3)', borderRadius: 4, border: '1px solid var(--brd)' }}>
              <input type="checkbox" id="lgpd" checked={lgpd} onChange={event => setLgpd(event.target.checked)} style={{ marginTop: 2, accentColor: 'var(--gold)', width: 14, height: 14, flexShrink: 0 }} />
              <label htmlFor="lgpd" style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.6, cursor: 'pointer' }}>
                Li e concordo com os <Link to="/termos-de-uso" target="_blank" style={{ color: 'var(--gold)' }}>Termos de Uso</Link> e a <Link to="/politica-de-privacidade" target="_blank" style={{ color: 'var(--gold)' }}>Politica de Privacidade</Link>. Autorizo o tratamento dos meus dados pessoais para fins de agendamento. <em style={{ color: 'var(--gold)' }}>*Obrigatorio</em>
              </label>
            </div>
          </div>
        </div>
      )}

      {step === 4 && svc && brb && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13, color: 'var(--t2)', fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Confirme o Agendamento</h3>
          {[
            ['Servico', svc.name],
            ['Barbeiro', brb.name],
            ['Data', formatDatePT(selectedDate)],
            ['Horario', selectedTime],
            ['Duracao', `${svc.durationMinutes} minutos`],
            ['Valor', `R$ ${svc.price.toFixed(2)}`],
            ['Cliente', form.name],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--brd)', fontSize: 13 }}>
              <span style={{ color: 'var(--t2)' }}>{label}</span>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(201,168,76,0.06)', border: '1px solid var(--brd-g)', borderRadius: 4, fontSize: 11, color: 'var(--t2)', lineHeight: 1.6 }}>
            Ao confirmar, seu horario e reservado automaticamente. Se quiser, voce pode abrir o WhatsApp da barbearia para confirmar o atendimento manualmente.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <button className="btn-ghost btn-sm" onClick={() => (step > 0 ? setStep(current => current - 1) : nav('/'))} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <ChevronLeft size={13} /> {step === 0 ? 'Voltar' : 'Anterior'}
        </button>
        {step < 4 ? (
          <button className="btn-gold btn-sm" disabled={!canNext()} onClick={() => setStep(current => current + 1)}>
            Proximo <ChevronRight size={13} />
          </button>
        ) : (
          <button className="btn-gold btn-sm" onClick={handleConfirm}>
            Confirmar Agendamento
          </button>
        )}
      </div>
    </div>
  )
}
