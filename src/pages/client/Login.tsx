import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '@/store/AppContext'

export default function Login() {
  const { loginAsClient } = useApp()
  const nav = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handle() {
    if (!form.email.trim() || !form.password) {
      setErr('Preencha e-mail e senha.')
      return
    }

    setSubmitting(true)
    setErr('')
    const result = await loginAsClient({ email: form.email.trim(), password: form.password })
    setSubmitting(false)

    if (!result.ok) {
      setErr(result.error ?? 'Nao foi possivel autenticar a conta.')
      return
    }

    nav('/meus-agendamentos')
  }

  return (
    <div style={{ minHeight:'calc(100vh - 52px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'radial-gradient(ellipse at center,rgba(201,168,76,0.05) 0%,transparent 60%)' }}>
      <div className="card card-gold" style={{ padding:32, width:'100%', maxWidth:380 }}>
        <h2 style={{ fontSize:20, marginBottom:4 }}>Bem-vindo de volta</h2>
        <p style={{ fontSize:12, color:'var(--t2)', marginBottom:22 }}>Entre na sua conta para agendar</p>
        {err && <div style={{ background:'rgba(192,57,43,0.12)', border:'1px solid rgba(192,57,43,0.3)', color:'#E74C3C', padding:'8px 12px', borderRadius:4, marginBottom:14, fontSize:12 }}>{err}</div>}
        <div style={{ marginBottom:13 }}>
          <label style={{ fontSize:11, color:'var(--t3)', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:5 }}>E-mail</label>
          <input className="inp" type="email" placeholder="seu@email.com" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))}/>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, color:'var(--t3)', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:5 }}>Senha</label>
          <input className="inp" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))}/>
        </div>
        <button className="btn-gold" style={{ width:'100%', justifyContent:'center' }} onClick={handle} disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
        <p style={{ textAlign:'center', marginTop:16, fontSize:12, color:'var(--t2)' }}>
          Não tem conta? <Link to="/cadastro" style={{ color:'var(--gold)' }}>Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
