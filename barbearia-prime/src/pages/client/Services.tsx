import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { Clock } from 'lucide-react'

export default function Services() {
  const { services } = useApp()
  const nav = useNavigate()
  const active = services.filter(s => s.active)
  return (
    <div className="page-wrap">
      <div className="section-tag">O que oferecemos</div>
      <div className="section-title">Nossos Serviços</div>
      <div className="section-sub">Escolha o serviço e agende agora</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
        {active.map(s => (
          <div key={s.id} className="card" style={{ padding:20 }}>
            <div style={{ width:36,height:36,background:'rgba(201,168,76,0.08)',border:'1px solid var(--brd-g)',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,fontSize:16 }}>✂</div>
            <div style={{ fontSize:15,fontWeight:500,marginBottom:5 }}>{s.name}</div>
            <p style={{ fontSize:12,color:'var(--t2)',lineHeight:1.6,marginBottom:12 }}>{s.description}</p>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
              <span style={{ color:'var(--gold)',fontWeight:500,fontSize:16 }}>R$ {s.price}</span>
              <span style={{ fontSize:11,color:'var(--t3)',display:'flex',alignItems:'center',gap:3 }}><Clock size={11}/> {s.durationMinutes}min</span>
            </div>
            <button className="btn-gold btn-sm" style={{ width:'100%' }} onClick={() => nav('/agendar')}>Agendar</button>
          </div>
        ))}
      </div>
    </div>
  )
}
