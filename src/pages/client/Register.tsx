import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { sanitize, sanitizeEmail, sanitizePhone } from '@/lib/sanitize'

export default function Register() {
  const { registerClient } = useApp()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [lgpd, setLgpd] = useState(false)
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fields: Array<{ key: keyof typeof form; label: string; type: string; placeholder: string }> = [
    { key: 'name', label: 'Nome completo *', type: 'text', placeholder: 'Seu nome' },
    { key: 'phone', label: 'WhatsApp *', type: 'tel', placeholder: '(11) 99999-0000' },
    { key: 'email', label: 'E-mail *', type: 'email', placeholder: 'seu@email.com' },
    { key: 'password', label: 'Senha *', type: 'password', placeholder: 'Minimo 8 caracteres' },
  ]

  async function handle() {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.password) {
      setErr('Nome, WhatsApp, e-mail e senha sao obrigatorios.')
      return
    }
    if (form.password.length < 8) {
      setErr('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (!lgpd) {
      setErr('Aceite os Termos de Uso e Politica de Privacidade para continuar.')
      return
    }

    setErr('')
    setSubmitting(true)
    const result = await registerClient({
      name: sanitize(form.name),
      phone: sanitizePhone(form.phone),
      email: sanitizeEmail(form.email),
      password: form.password,
      lgpdAccepted: true,
      lgpdTimestamp: new Date().toISOString(),
    })
    setSubmitting(false)

    if (!result.ok) {
      setErr(result.error ?? 'Nao foi possivel criar a conta.')
      return
    }

    nav('/login', { state: { registered: true } })
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'radial-gradient(ellipse at center,rgba(201,168,76,0.05) 0%,transparent 60%)' }}>
      <div className="card card-gold" style={{ padding: 32, width: '100%', maxWidth: 400 }}>
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>Criar conta</h2>
        <p style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 20 }}>Cadastre-se para agendar com facilidade</p>
        {err && <div style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', color: '#E74C3C', padding: '8px 12px', borderRadius: 4, marginBottom: 14, fontSize: 12 }}>{err}</div>}
        {fields.map(field => (
          <div key={field.key} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>{field.label}</label>
            <input
              className="inp"
              type={field.type}
              placeholder={field.placeholder}
              value={form[field.key]}
              onChange={event => setForm(previous => ({ ...previous, [field.key]: event.target.value }))}
            />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '12px', background: 'var(--bg3)', borderRadius: 4, border: '1px solid var(--brd)', margin: '16px 0 20px' }}>
          <input type="checkbox" id="lgpd" checked={lgpd} onChange={event => setLgpd(event.target.checked)} style={{ marginTop: 2, accentColor: 'var(--gold)', width: 14, height: 14, flexShrink: 0 }} />
          <label htmlFor="lgpd" style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.6, cursor: 'pointer' }}>
            Li e concordo com os <Link to="/termos-de-uso" target="_blank" style={{ color: 'var(--gold)' }}>Termos de Uso</Link> e a <Link to="/politica-de-privacidade" target="_blank" style={{ color: 'var(--gold)' }}>Politica de Privacidade</Link>. Autorizo o tratamento dos meus dados pessoais. <em style={{ color: 'var(--gold)' }}>*Obrigatorio</em>
          </label>
        </div>
        <button className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={handle} disabled={submitting}>
          {submitting ? 'Criando conta...' : 'Criar Conta'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--t2)' }}>
          Ja tem conta? <Link to="/login" style={{ color: 'var(--gold)' }}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}
