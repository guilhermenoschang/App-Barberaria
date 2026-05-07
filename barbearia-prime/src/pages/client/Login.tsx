import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { sanitize, sanitizePhone } from '@/lib/sanitize'

export default function Login() {
  const { loginAsClient } = useApp()
  const nav = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })

  function handle() {
    // MVP: simulado — substituir por Supabase Auth em produção
    loginAsClient({ id: `u_${Date.now()}`, name: 'Cliente', phone: '', lgpdAccepted: true })
    nav('/meus-agendamentos')
  }

  return (
    <div style={{ minHeight:'calc(100vh - 52px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'radial-gradient(ellipse at center,rgba(201,168,76,0.05) 0%,transparent 60%)' }}>
      <div className="card card-gold" style={{ padding:32, width:'100%', maxWidth:380 }}>
        <div className="mock-banner">⚠ MVP — autenticação simulada</div>
        <h2 style={{ fontSize:20, marginBottom:4 }}>Bem-vindo de volta</h2>
        <p style={{ fontSize:12, color:'var(--t2)', marginBottom:22 }}>Entre na sua conta para agendar</p>
        <div style={{ marginBottom:13 }}>
          <label style={{ fontSize:11, color:'var(--t3)', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:5 }}>E-mail</label>
          <input className="inp" type="email" placeholder="seu@email.com" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))}/>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, color:'var(--t3)', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:5 }}>Senha</label>
          <input className="inp" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))}/>
        </div>
        <button className="btn-gold" style={{ width:'100%', justifyContent:'center' }} onClick={handle}>Entrar</button>
        <p style={{ textAlign:'center', marginTop:16, fontSize:12, color:'var(--t2)' }}>
          Não tem conta? <Link to="/cadastro" style={{ color:'var(--gold)' }}>Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
