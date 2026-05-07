import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'

export default function Profile() {
  const { sessionUser, loginAsClient, logout } = useApp()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: sessionUser?.name||'', phone: sessionUser?.phone||'', email: sessionUser?.email||'' })
  const [saved, setSaved] = useState(false)

  if (!sessionUser) { nav('/login'); return null }

  function save() {
    loginAsClient({ ...sessionUser!, name: form.name, phone: form.phone, email: form.email })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = form.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'U'

  return (
    <div className="page-wrap" style={{ maxWidth:480 }}>
      <div className="section-title">Meu Perfil</div>
      <div className="section-sub">Suas informações pessoais</div>
      <div className="card" style={{ padding:24 }}>
        <div style={{ width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,#9C7A2E,#C9A84C)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:700,color:'#080808',marginBottom:20,fontFamily:'Playfair Display,serif' }}>{initials}</div>
        {[
          { key:'name', label:'Nome', type:'text' },
          { key:'phone', label:'WhatsApp', type:'tel' },
          { key:'email', label:'E-mail', type:'email' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom:13 }}>
            <label style={{ fontSize:11,color:'var(--t3)',textTransform:'uppercase',letterSpacing:0.5,display:'block',marginBottom:5 }}>{f.label}</label>
            <input className="inp" type={f.type} value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}/>
          </div>
        ))}
        <div style={{ display:'flex',gap:10,marginTop:18,flexWrap:'wrap' }}>
          <button className="btn-gold btn-sm" onClick={save}>{saved ? '✓ Salvo!' : 'Salvar'}</button>
          <button className="btn-danger" style={{ fontSize:12 }} onClick={() => { logout(); nav('/') }}>Sair da Conta</button>
        </div>
        {sessionUser.lgpdAccepted && (
          <div style={{ marginTop:18,paddingTop:16,borderTop:'1px solid var(--brd)',fontSize:11,color:'var(--t3)',lineHeight:1.8 }}>
            Consentimento LGPD aceito: <strong style={{ color:'var(--t2)' }}>{sessionUser.lgpdTimestamp ? new Date(sessionUser.lgpdTimestamp).toLocaleString('pt-BR') : 'Sim'}</strong><br/>
            <a href="#" style={{ color:'var(--gold)',fontSize:11 }}>Solicitar exclusão de dados</a>
          </div>
        )}
      </div>
    </div>
  )
}
