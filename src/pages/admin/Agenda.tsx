import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { addDaysStr, formatDatePT, todayStr } from '@/lib/dates'
import { getAvailableSlots, validateAppointmentSlot } from '@/lib/slots'
import { sanitize, sanitizePhone } from '@/lib/sanitize'
import { openBarberiaWhatsApp } from '@/lib/whatsapp'

const statusMap: Record<string, { cls: string; label: string }> = {
  confirmed: { cls: 'badge-ok', label: 'Confirmado' },
  cancelled: { cls: 'badge-err', label: 'Cancelado' },
  completed: { cls: 'badge-blue', label: 'Concluido' },
}

export default function Agenda() {
  const {
    appointments,
    barbers,
    services,
    schedule,
    holidays,
    blockedSlots,
    updateAppointmentStatus,
    addAppointment,
    addNotification,
    config,
  } = useApp()

  const [date, setDate] = useState(todayStr())
  const [filterBarber, setFilterBarber] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState('')
  const [newAppt, setNewAppt] = useState({
    clientName: '',
    clientPhone: '',
    serviceId: '',
    barberId: '',
    time: '',
    observation: '',
  })

  const selectedService = services.find(service => service.id === newAppt.serviceId)

  const manualSlotResult = useMemo(() => {
    if (!showForm || !newAppt.barberId || !selectedService) return { slots: [], isClosed: false }

    return getAvailableSlots(
      date,
      newAppt.barberId,
      appointments,
      services,
      schedule,
      holidays,
      blockedSlots,
      config.intervalMinutes,
      selectedService.durationMinutes
    )
  }, [
    appointments,
    blockedSlots,
    config.intervalMinutes,
    date,
    holidays,
    newAppt.barberId,
    schedule,
    selectedService,
    services,
    showForm,
  ])

  const filtered = appointments
    .filter(appointment => appointment.date === date)
    .filter(appointment => filterBarber === 'all' || appointment.barberId === filterBarber)
    .filter(appointment => filterStatus === 'all' || appointment.status === filterStatus)
    .sort((left, right) => left.time.localeCompare(right.time))

  function closeManualForm() {
    setNewAppt({ clientName: '', clientPhone: '', serviceId: '', barberId: '', time: '', observation: '' })
    setFormError('')
    setShowForm(false)
  }

  function handleChange<K extends keyof typeof newAppt>(field: K, value: (typeof newAppt)[K]) {
    setNewAppt(previous => {
      const next = { ...previous, [field]: value }
      if (field === 'serviceId' || field === 'barberId') next.time = ''
      return next
    })
    setFormError('')
  }

  function createManual() {
    const service = services.find(item => item.id === newAppt.serviceId)
    const barber = barbers.find(item => item.id === newAppt.barberId)
    const clientName = sanitize(newAppt.clientName)
    const clientPhone = sanitizePhone(newAppt.clientPhone)

    if (!service || !barber || !clientName || !clientPhone || !newAppt.time) {
      setFormError('Preencha cliente, telefone, servico, barbeiro e horario.')
      return
    }

    const validation = validateAppointmentSlot(
      date,
      newAppt.time,
      barber.id,
      service.durationMinutes,
      appointments,
      services,
      schedule,
      holidays,
      blockedSlots,
      config.intervalMinutes
    )

    if (!validation.ok) {
      setFormError('Esse horario nao esta disponivel para esse barbeiro e servico. Escolha outro slot valido.')
      setNewAppt(previous => ({ ...previous, time: '' }))
      return
    }

    addAppointment({
      id: `ap_${Date.now()}`,
      clientName,
      clientPhone,
      observation: newAppt.observation ? sanitize(newAppt.observation) : undefined,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      barberId: barber.id,
      barberName: barber.name,
      date,
      time: newAppt.time,
      status: 'confirmed',
      lgpdConsent: false,
      createdAt: new Date().toISOString(),
    })
    addNotification({
      message: `Agendamento manual criado para ${clientName} com ${barber.name} as ${newAppt.time}.`,
      type: 'info',
    })
    closeManualForm()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: 'Playfair Display,serif' }}>Agenda</h2>
          <p style={{ fontSize: 12, color: 'var(--t3)' }}>{formatDatePT(date)}</p>
        </div>
        <button className="btn-gold btn-sm" onClick={() => setShowForm(current => !current)}>+ Agendamento Manual</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn-ghost btn-sm" onClick={() => setDate(todayStr())}>Hoje</button>
        <button className="btn-ghost btn-sm" onClick={() => setDate(addDaysStr(date, -1))}><ChevronLeft size={12} /></button>
        <input type="date" className="inp" value={date} onChange={event => event.target.value && setDate(event.target.value)} style={{ maxWidth: 160 }} />
        <button className="btn-ghost btn-sm" onClick={() => setDate(addDaysStr(date, 1))}><ChevronRight size={12} /></button>
        <select className="inp" value={filterBarber} onChange={event => setFilterBarber(event.target.value)} style={{ maxWidth: 160 }}>
          <option value="all">Todos os barbeiros</option>
          {barbers.map(barber => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
        </select>
        <select className="inp" value={filterStatus} onChange={event => setFilterStatus(event.target.value)} style={{ maxWidth: 150 }}>
          <option value="all">Todos os status</option>
          <option value="confirmed">Confirmados</option>
          <option value="cancelled">Cancelados</option>
          <option value="completed">Concluidos</option>
        </select>
      </div>

      {showForm && (
        <div className="card card-gold" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Novo Agendamento Manual</div>
          {formError && (
            <div style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', color: '#E74C3C', padding: '10px 12px', borderRadius: 4, marginBottom: 12, fontSize: 12 }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Nome *</label>
              <input className="inp" value={newAppt.clientName} onChange={event => handleChange('clientName', event.target.value)} placeholder="Nome do cliente" />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>WhatsApp *</label>
              <input className="inp" value={newAppt.clientPhone} onChange={event => handleChange('clientPhone', event.target.value)} placeholder="(11) 99999-0000" />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Servico *</label>
              <select className="inp" value={newAppt.serviceId} onChange={event => handleChange('serviceId', event.target.value)}>
                <option value="">Selecione</option>
                {services.filter(service => service.active).map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Barbeiro *</label>
              <select className="inp" value={newAppt.barberId} onChange={event => handleChange('barberId', event.target.value)}>
                <option value="">Selecione</option>
                {barbers.filter(barber => barber.active).map(barber => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Horario *</label>
              <select className="inp" value={newAppt.time} onChange={event => handleChange('time', event.target.value)} disabled={!newAppt.barberId || !selectedService || manualSlotResult.isClosed || manualSlotResult.slots.length === 0}>
                <option value="">{selectedService && newAppt.barberId ? 'Selecione um slot' : 'Escolha servico e barbeiro'}</option>
                {manualSlotResult.slots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Observacao</label>
              <textarea className="inp" value={newAppt.observation} rows={2} onChange={event => handleChange('observation', event.target.value)} placeholder="Detalhes opcionais do atendimento" />
            </div>
          </div>

          {manualSlotResult.holidayInfo && (
            <div style={{ marginTop: 12, fontSize: 12, color: '#E67E22' }}>
              {manualSlotResult.holidayInfo.name}
              {manualSlotResult.holidayInfo.type === 'reduced' && ` - Horario reduzido: ${manualSlotResult.holidayInfo.openTime}-${manualSlotResult.holidayInfo.closeTime}`}
              {manualSlotResult.holidayInfo.type === 'closed' && ' - Fechado'}
            </div>
          )}
          {selectedService && newAppt.barberId && manualSlotResult.isClosed && (
            <p style={{ marginTop: 12, fontSize: 12, color: 'var(--t3)' }}>Nao ha atendimento disponivel nesta data.</p>
          )}
          {selectedService && newAppt.barberId && !manualSlotResult.isClosed && manualSlotResult.slots.length === 0 && (
            <p style={{ marginTop: 12, fontSize: 12, color: 'var(--t3)' }}>Nao ha slots livres para a duracao deste servico.</p>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn-gold btn-sm" onClick={createManual}>Criar Agendamento</button>
            <button className="btn-ghost btn-sm" onClick={closeManualForm}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--t3)' }}>Nenhum agendamento para este filtro.</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>Servico</th>
                  <th>Barbeiro</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>LGPD</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(appointment => {
                  const status = statusMap[appointment.status] || { cls: 'badge-warn', label: appointment.status }

                  return (
                    <tr key={appointment.id}>
                      <td style={{ color: 'var(--gold)', fontWeight: 500 }}>{appointment.time}</td>
                      <td>{appointment.clientName}</td>
                      <td style={{ fontSize: 11 }}>{appointment.clientPhone}</td>
                      <td>{appointment.serviceName}</td>
                      <td>{appointment.barberName}</td>
                      <td style={{ color: 'var(--gold)' }}>R${appointment.servicePrice}</td>
                      <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                      <td>
                        {appointment.lgpdConsent
                          ? <span style={{ fontSize: 10, color: '#2ECC71' }}>Aceito</span>
                          : <span style={{ fontSize: 10, color: '#E74C3C' }}>Pendente</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {appointment.status === 'confirmed' && (
                            <>
                              <button className="btn-gold btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => updateAppointmentStatus(appointment.id, 'completed')}>Concluir</button>
                              <button className="btn-danger" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}>Cancelar</button>
                            </>
                          )}
                          <button onClick={() => openBarberiaWhatsApp(config)} style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', color: '#2ECC71' }} title="WhatsApp">WhatsApp</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
