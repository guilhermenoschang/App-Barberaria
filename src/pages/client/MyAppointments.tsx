import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { formatDatePT } from '@/lib/dates'
import { appointmentBelongsToUser } from '@/lib/appointmentAccess'
import { openBarberiaWhatsApp } from '@/lib/whatsapp'
import { Scissors } from 'lucide-react'

const statusMap: Record<string,{cls:string,label:string}> = {
  confirmed: { cls:'badge-ok', label:'Confirmado' },
  cancelled:  { cls:'badge-err', label:'Cancelado' },
  completed:  { cls:'badge-blue', label:'Concluído' },
}

export default function MyAppointments() {
  const { appointments, sessionUser, cancelOwnAppointment, config } = useApp()
  const nav = useNavigate()

  const myAppts = sessionUser
    ? appointments.filter(a => appointmentBelongsToUser(a, sessionUser))
    : []

  if (!sessionUser) {
    return (
      <div className="page-wrap" style={{ textAlign:'center', paddingTop: 60 }}>
        <Scissors size={36} style={{ color:'var(--t3)', marginBottom:16 }}/>
        <h2 style={{ fontSize:20, marginBottom:8 }}>Faça login para ver seus agendamentos</h2>
        <p style={{ color:'var(--t2)', fontSize:13, marginBottom:20 }}>Apenas você pode ver seus próprios agendamentos.</p>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button className="btn-gold" onClick={() => nav('/login')}>Entrar</button>
          <button className="btn-ghost btn-sm" onClick={() => nav('/cadastro')}>Criar conta</button>
        </div>
      </div>
    )
  }

  function cancel(id: string) {
    if (!confirm('Cancelar este agendamento?')) return
    const result = cancelOwnAppointment(id)
    if (!result.ok) alert(result.error)
  }

  return (
    <div className="page-wrap">
      <div className="section-title">Meus Agendamentos</div>
      <div className="section-sub">Olá, {sessionUser.name} — aqui estão seus horários</div>

      {myAppts.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 0' }}>
          <Scissors size={32} style={{ color:'var(--t3)', marginBottom:12 }}/>
          <p style={{ color:'var(--t2)', fontSize:13, marginBottom:16 }}>Você ainda não tem agendamentos.</p>
          <button className="btn-gold" onClick={() => nav('/agendar')}>Agendar agora</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {myAppts.map(a => {
            const st = statusMap[a.status] || { cls:'badge-warn', label:a.status }
            const canCancel = a.status === 'confirmed'
            return (
              <div key={a.id} className="card" style={{ padding:16, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexWrap:'wrap' }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:500, marginBottom:3 }}>{a.serviceName}</div>
                  <div style={{ fontSize:12, color:'var(--t2)', lineHeight:1.7 }}>
                    Barbeiro: <strong style={{ color:'var(--t1)' }}>{a.barberName}</strong><br/>
                    {formatDatePT(a.date)} às <strong style={{ color:'var(--t1)' }}>{a.time}</strong>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:7, alignItems:'flex-end' }}>
                  <span className={`badge ${st.cls}`}>{st.label}</span>
                  <span style={{ color:'var(--gold)', fontWeight:500, fontSize:14 }}>R$ {a.servicePrice.toFixed(2)}</span>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    <button className="btn-ghost btn-sm" onClick={() => openBarberiaWhatsApp(config)} style={{ fontSize:11 }}>💬 WhatsApp</button>
                    {canCancel && <button className="btn-danger" style={{ fontSize:11, padding:'5px 12px' }} onClick={() => cancel(a.id)}>Cancelar</button>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
