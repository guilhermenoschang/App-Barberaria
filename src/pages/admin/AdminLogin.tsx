import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { Scissors, Lock } from 'lucide-react'

export default function AdminLogin() {
  const { loginAsAdmin, theme, setTheme } = useApp()
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handle() {
    if (!form.email || !form.password) { setErr('Preencha e-mail e senha.'); return }
    setSubmitting(true)
    const result = await loginAsAdmin({ email: form.email.trim(), password: form.password })
    setSubmitting(false)
    if (!result.ok) { setErr(result.error ?? 'Nao foi possivel autenticar o administrador.'); return }
    nav('/admin/dashboard')
  }

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--bg0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card card-gold" style={{ padding: 36, width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, background: 'rgba(201,168,76,0.1)', border: '1px solid var(--brd-g)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Scissors size={20} color="var(--gold)" />
          </div>
          <h2 style={{ fontSize: 20, marginBottom: 3 }}>Painel Administrativo</h2>
          <p style={{ fontSize: 12, color: 'var(--t3)' }}>Acesso restrito — somente administradores</p>
        </div>
        {err && <div style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', color: '#E74C3C', padding: '8px 12px', borderRadius: 4, marginBottom: 14, fontSize: 12 }}>{err}</div>}

        <div style={{ marginBottom: 13 }}>
          <label style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>E-mail</label>
          <input className="inp" type="email" placeholder="admin@barbeariaprime.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>Senha</label>
          <input className="inp" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
        </div>

        <button className="btn-gold" style={{ width: '100%', justifyContent: 'center', gap: 8 }} onClick={handle} disabled={submitting}>
          <Lock size={14} /> {submitting ? 'Validando...' : 'Acessar Painel'}
        </button>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {(['dark','gray','light'] as const).map(t => (
            <button key={t} onClick={() => setTheme(t)} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 3, border: '1px solid var(--brd)', background: theme === t ? 'var(--gold)' : 'transparent', color: theme === t ? '#080808' : 'var(--t3)', cursor: 'pointer' }}>
              {t === 'dark' ? 'Dark' : t === 'gray' ? 'Cinza' : 'Light'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
