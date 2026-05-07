import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { todayStr, formatDatePT, formatDateShort, addDaysStr } from '@/lib/dates'
import { openBarberiaWhatsApp } from '@/lib/whatsapp'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const statusMap: Record<string, { cls: string; label: string }> = {
  confirmed: { cls: 'badge-ok', label: 'Confirmado' },
  cancelled:  { cls: 'badge-err', label: 'Cancelado' },
  completed:  { cls: 'badge-blue', label: 'Concluído' },
}

export default function Agenda() {
  const { appointments, barbers, services, updateAppointmentStatus, addAppointment, config } = useApp()
  const [date, setDate] = useState(todayStr())
  const [filterBarber, setFilterBarber] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [newAppt, setNewAppt] = useState({ clientName:'', clientPhone:'', serviceId:'', barberId:'', time:'', observation:'' })

  const filtered = appointments
    .filter(a => a.date === date)
    .filter(a => filterBarber === 'all' || a.barberId === filterBarber)
    .filter(a => filterStatus === 'all' || a.status === filterStatus)
    .sort((a, b) => a.time.localeCompare(b.time))

  function createManual() {
    const svc = services.find(s => s.id === newAppt.serviceId)
    const brb = barbers.find(b => b.id === newAppt.barberId)
    if (!svc || !brb || !newAppt.clientName || !newAppt.clientPhone || !newAppt.time) return
    addAppointment({
      id: `ap_${Date.now()}`, clientName: newAppt.clientName, clientPhone: newAppt.clientPhone,
      serviceId: svc.id, serviceName: svc.name, servicePrice: svc.price,
      barberId: brb.id, barberName: brb.name,
      date, time: newAppt.time, status: 'confirmed',
      lgpdConsent: false, createdAt: new Date().toISOString(),
    })
    setNewAppt({ clientName:'', clientPhone:'', serviceId:'', barberId:'', time:'', observation:'' })
    setShowForm(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: 'Playfair Display,serif' }}>Agenda</h2>
          <p style={{ fontSize: 12, color: 'var(--t3)' }}>{formatDatePT(date)}</p>
        </div>
        <button className="btn-gold btn-sm" onClick={() => setShowForm(s => !s)}>+ Agendamento Manual</button>
      </div>

      {/* Date nav */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn-ghost btn-sm" onClick={() => setDate(todayStr())}>Hoje</button>
        <button className="btn-ghost btn-sm" onClick={() => setDate(addDaysStr(date, -1))}><ChevronLeft size={12}/></button>
        <input type="date" className="inp" value={date} onChange={e => e.target.value && setDate(e.target.value)} style={{ maxWidth: 160 }}/>
        <button className="btn-ghost btn-sm" onClick={() => setDate(addDaysStr(date, 1))}><ChevronRight size={12}/></button>
        <select className="inp" value={filterBarber} onChange={e => setFilterBarber(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="all">Todos os barbeiros</option>
          {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select className="inp" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 150 }}>
          <option value="all">Todos os status</option>
          <option value="confirmed">Confirmados</option>
          <option value="cancelled">Cancelados</option>
          <option value="completed">Concluídos</option>
        </select>
      </div>

      {/* Manual form */}
      {showForm && (
        <div className="card card-gold" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Novo Agendamento Manual</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
            <div><label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Nome *</label><input className="inp" value={newAppt.clientName} onChange={e => setNewAppt(p=>({...p,clientName:e.target.value}))} placeholder="Nome do cliente"/></div>
            <div><label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>WhatsApp *</label><input className="inp" value={newAppt.clientPhone} onChange={e => setNewAppt(p=>({...p,clientPhone:e.target.value}))} placeholder="(11) 99999-0000"/></div>
            <div><label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Serviço *</label>
              <select className="inp" value={newAppt.serviceId} onChange={e => setNewAppt(p=>({...p,serviceId:e.target.value}))}>
                <option value="">Selecione</option>
                {services.filter(s=>s.active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div><label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Barbeiro *</label>
              <select className="inp" value={newAppt.barberId} onChange={e => setNewAppt(p=>({...p,barberId:e.target.value}))}>
                <option value="">Selecione</option>
                {barbers.filter(b=>b.active).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div><label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Horário *</label><input className="inp" type="time" value={newAppt.time} onChange={e => setNewAppt(p=>({...p,time:e.target.value}))}/></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn-gold btn-sm" onClick={createManual}>Criar Agendamento</button>
            <button className="btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--t3)' }}>Nenhum agendamento para este filtro.</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Hora</th><th>Cliente</th><th>Telefone</th><th>Serviço</th>
                  <th>Barbeiro</th><th>Valor</th><th>Status</th><th>LGPD</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const st = statusMap[a.status] || { cls: 'badge-warn', label: a.status }
                  return (
                    <tr key={a.id}>
                      <td style={{ color: 'var(--gold)', fontWeight: 500 }}>{a.time}</td>
                      <td>{a.clientName}</td>
                      <td style={{ fontSize: 11 }}>{a.clientPhone}</td>
                      <td>{a.serviceName}</td>
                      <td>{a.barberName}</td>
                      <td style={{ color: 'var(--gold)' }}>R${a.servicePrice}</td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td>
                        {a.lgpdConsent
                          ? <span style={{ fontSize: 10, color: '#2ECC71' }}>✓ Aceito</span>
                          : <span style={{ fontSize: 10, color: '#E74C3C' }}>✗ Pend.</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {a.status === 'confirmed' && (
                            <>
                              <button className="btn-gold btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => updateAppointmentStatus(a.id, 'completed')}>Concluir</button>
                              <button className="btn-danger" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => updateAppointmentStatus(a.id, 'cancelled')}>Cancelar</button>
                            </>
                          )}
                          <button onClick={() => openBarberiaWhatsApp(config)} style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', color: '#2ECC71' }} title="WhatsApp">💬</button>
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
