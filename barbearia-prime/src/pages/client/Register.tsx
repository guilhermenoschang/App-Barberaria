import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { sanitize, sanitizePhone, sanitizeEmail } from '@/lib/sanitize'

const POLICY_VERSION = 'v1.0', TERMS_VERSION = 'v1.0'

export default function Register() {
  const { loginAsClient } = useApp()
  const nav = useNavigate()
  const [form, setForm] = useState({ name:'', phone:'', email:'', password:'' })
  const [lgpd, setLgpd] = useState(false)
  const [err, setErr] = useState('')

  function handle() {
    if (!form.name.trim() || !form.phone.trim()) { setErr('Nome e WhatsApp são obrigatórios.'); return }
    if (!lgpd) { setErr('Aceite os Termos de Uso e Política de Privacidade para continuar.'); return }
    setErr('')
    loginAsClient({
      id: `u_${Date.now()}`,
      name: sanitize(form.name),
      phone: sanitizePhone(form.phone),
      email: form.email ? sanitizeEmail(form.email) : undefined,
      lgpdAccepted: true,
      lgpdTimestamp: new Date().toISOString(),
    })
    nav('/meus-agendamentos')
  }

  return (
    <div style={{ minHeight:'calc(100vh - 52px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'radial-gradient(ellipse at center,rgba(201,168,76,0.05) 0%,transparent 60%)' }}>
      <div className="card card-gold" style={{ padding:32, width:'100%', maxWidth:400 }}>
        <div className="mock-banner">⚠ MVP — autenticação simulada</div>
        <h2 style={{ fontSize:20, marginBottom:4 }}>Criar conta</h2>
        <p style={{ fontSize:12, color:'var(--t2)', marginBottom:20 }}>Cadastre-se para agendar com facilidade</p>
        {err && <div style={{ background:'rgba(192,57,43,0.12)', border:'1px solid rgba(192,57,43,0.3)', color:'#E74C3C', padding:'8px 12px', borderRadius:4, marginBottom:14, fontSize:12 }}>{err}</div>}
        {[
          { key:'name', label:'Nome completo *', type:'text', ph:'Seu nome' },
          { key:'phone', label:'WhatsApp *', type:'tel', ph:'(11) 99999-0000' },
          { key:'email', label:'E-mail (opcional)', type:'email', ph:'seu@email.com' },
          { key:'password', label:'Senha *', type:'password', ph:'Mínimo 8 caracteres' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:'var(--t3)', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:5 }}>{f.label}</label>
            <input className="inp" type={f.type} placeholder={f.ph} value={(form as any)[f.key]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))}/>
          </div>
        ))}
        <div style={{ display:'flex', gap:9, alignItems:'flex-start', padding:'12px', background:'var(--bg3)', borderRadius:4, border:'1px solid var(--brd)', margin:'16px 0 20px' }}>
          <input type="checkbox" id="lgpd" checked={lgpd} onChange={e => setLgpd(e.target.checked)} style={{ marginTop:2, accentColor:'var(--gold)', width:14, height:14, flexShrink:0 }}/>
          <label htmlFor="lgpd" style={{ fontSize:11, color:'var(--t2)', lineHeight:1.6, cursor:'pointer' }}>
            Li e concordo com os <Link to="/termos-de-uso" target="_blank" style={{ color:'var(--gold)' }}>Termos de Uso</Link> e a <Link to="/politica-de-privacidade" target="_blank" style={{ color:'var(--gold)' }}>Política de Privacidade</Link>. Autorizo o tratamento dos meus dados pessoais. <em style={{ color:'var(--gold)' }}>*Obrigatório</em>
          </label>
        </div>
        <button className="btn-gold" style={{ width:'100%', justifyContent:'center' }} onClick={handle}>Criar Conta</button>
        <p style={{ textAlign:'center', marginTop:14, fontSize:12, color:'var(--t2)' }}>
          Já tem conta? <Link to="/login" style={{ color:'var(--gold)' }}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}
