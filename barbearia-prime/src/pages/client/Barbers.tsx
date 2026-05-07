import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'

export default function Barbers() {
  const { barbers } = useApp()
  const nav = useNavigate()
  const active = barbers.filter(b => b.active)
  return (
    <div className="page-wrap">
      <div className="section-tag">Nossa Equipe</div>
      <div className="section-title">Barbeiros</div>
      <div className="section-sub">Profissionais qualificados à sua disposição</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
        {active.map(b => (
          <div key={b.id} className="card" style={{ padding:24, textAlign:'center' }}>
            <div style={{ width:72,height:72,borderRadius:'50%',background:'var(--bg4)',border:'2px solid var(--gold-d, #9C7A2E)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',overflow:'hidden',fontSize:28 }}>
              {b.photo ? <img src={b.photo} alt={b.name} style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : '👤'}
            </div>
            <h3 style={{ fontFamily:'DM Sans',fontSize:16,fontWeight:500,marginBottom:4 }}>{b.name}</h3>
            <p style={{ fontSize:12,color:'var(--gold)',marginBottom:6 }}>{b.specialty}</p>
            <p style={{ fontSize:12,color:'var(--t3)',lineHeight:1.6,marginBottom:16 }}>{b.description}</p>
            <button className="btn-gold btn-sm" style={{ width:'100%' }} onClick={() => nav('/agendar')}>Agendar com {b.name.split(' ')[0]}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
