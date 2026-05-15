import { useApp } from '@/store/AppContext'
import { todayStr, formatDateShort } from '@/lib/dates'
import { openBarberiaWhatsApp } from '@/lib/whatsapp'
import { AlertTriangle } from 'lucide-react'

const statusMap: Record<string, { cls: string; label: string }> = {
  confirmed: { cls: 'badge-ok', label: 'Confirmado' },
  cancelled: { cls: 'badge-err', label: 'Cancelado' },
  completed: { cls: 'badge-blue', label: 'Concluído' },
}

export default function Dashboard() {
  const { appointments, barbers, services, config, updateAppointmentStatus } = useApp()
  const today = todayStr()

  const todayAppts = appointments.filter(a => a.date === today && a.status !== 'cancelled')
  const confirmed = todayAppts.filter(a => a.status === 'confirmed')
  const pendingCount = appointments.filter(a => a.status === 'confirmed' && a.date >= today).length
  const revenue = todayAppts.filter(a => a.status !== 'cancelled').reduce((s, a) => s + a.servicePrice, 0)
  const next = [...todayAppts].sort((a, b) => a.time.localeCompare(b.time))[0]

  // Service frequency
  const svcCount: Record<string, number> = {}
  appointments.forEach(a => { svcCount[a.serviceName] = (svcCount[a.serviceName] || 0) + 1 })
  const topServices = Object.entries(svcCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxSvc = topServices[0]?.[1] || 1

  // Barber perf today
  const barberStats = barbers.filter(b => b.active).map(b => {
    const bAppts = todayAppts.filter(a => a.barberId === b.id)
    return { name: b.name, count: bAppts.length, revenue: bAppts.reduce((s, a) => s + a.servicePrice, 0) }
  })

  // Alerts
  const alerts: string[] = []
  if (pendingCount > 0) alerts.push(`${pendingCount} agendamentos ativos hoje e próximos dias`)
  const noPrice = services.filter(s => s.active && s.price === 0)
  if (noPrice.length) alerts.push(`Serviço sem preço: ${noPrice.map(s => s.name).join(', ')}`)
  if (appointments.some(a => a.date === today && !a.lgpdConsent)) alerts.push('Há agendamentos de hoje sem consentimento LGPD registrado')

  return (
    <div>
      <div style={{ marginBottom: 6 }}>
        <h2 style={{ fontSize: 22, fontFamily: 'Playfair Display, serif' }}>Dashboard</h2>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 20 }}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Agend. Hoje', value: todayAppts.length, color: 'var(--gold)', sub: 'total confirmados' },
          { label: 'Próximo', value: next ? next.time : '—', color: 'var(--t1)', sub: next ? `${next.clientName} · ${next.barberName}` : 'nenhum agendado' },
          { label: 'Receita Prev.', value: `R$${revenue}`, color: '#2ECC71', sub: 'hoje' },
          { label: 'Confirmados', value: confirmed.length, color: '#3498DB', sub: 'hoje' },
          { label: 'Alertas', value: alerts.length, color: alerts.length ? '#E67E22' : 'var(--t3)', sub: alerts.length ? 'atenção' : 'tudo ok' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 10, letterSpacing: 1, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Playfair Display,serif', color: c.color, marginBottom: 3 }}>{c.value}</div>
            <div style={{ fontSize: 10, color: 'var(--t3)' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Quick agenda */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Agenda de Hoje</div>
          {todayAppts.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--t3)', padding: '12px 0' }}>Nenhum agendamento hoje.</p>
          ) : (
            [...todayAppts].sort((a, b) => a.time.localeCompare(b.time)).map(a => {
              const st = statusMap[a.status] || { cls: 'badge-warn', label: a.status }
              return (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--brd)', flexWrap: 'wrap', gap: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500, marginRight: 8, color: 'var(--gold)' }}>{a.time}</span>
                    <span style={{ fontSize: 12 }}>{a.clientName}</span>
                    <span style={{ fontSize: 11, color: 'var(--t3)', marginLeft: 6 }}>· {a.serviceName} · {a.barberName}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    <span className={`badge ${st.cls}`}>{st.label}</span>
                    {a.status === 'confirmed' && (
                      <>
                        <button className="btn-gold btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => updateAppointmentStatus(a.id, 'completed')}>Concluir</button>
                        <button className="btn-danger" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => updateAppointmentStatus(a.id, 'cancelled')}>Cancelar</button>
                      </>
                    )}
                    <button onClick={() => openBarberiaWhatsApp(config)} style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer' }} title="WhatsApp">💬</button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Services chart */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Serviços Mais Agendados</div>
          {topServices.length === 0 ? <p style={{ fontSize: 12, color: 'var(--t3)' }}>Sem dados.</p> : topServices.map(([name, count]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--t2)', width: 110, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
              <div style={{ flex: 1, background: 'var(--bg4)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${(count / maxSvc) * 100}%`, height: '100%', background: 'var(--gold)', borderRadius: 3, transition: 'width 0.4s' }}/>
              </div>
              <span style={{ fontSize: 11, color: 'var(--gold)', minWidth: 20, textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Barber performance */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Desempenho Hoje por Barbeiro</div>
          <table className="tbl">
            <thead><tr><th>Barbeiro</th><th>Agend.</th><th>Receita</th></tr></thead>
            <tbody>
              {barberStats.map(b => (
                <tr key={b.name}>
                  <td>{b.name}</td>
                  <td>{b.count}</td>
                  <td style={{ color: 'var(--gold)' }}>R${b.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Alerts */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Alertas Operacionais</div>
          {alerts.length === 0 ? (
            <div style={{ fontSize: 12, color: '#2ECC71', padding: '8px 0' }}>✓ Nenhum alerta. Tudo operando normalmente.</div>
          ) : alerts.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--brd)', fontSize: 12, color: '#E67E22' }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
