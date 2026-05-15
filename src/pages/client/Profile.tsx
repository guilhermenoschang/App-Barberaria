import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { sanitize, sanitizeEmail, sanitizePhone } from '@/lib/sanitize'

export default function Profile() {
  const { sessionUser, updateProfile, logout } = useApp()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: sessionUser?.name || '', phone: sessionUser?.phone || '', email: sessionUser?.email || '' })
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fields: Array<{ key: keyof typeof form; label: string; type: string }> = [
    { key: 'name', label: 'Nome', type: 'text' },
    { key: 'phone', label: 'WhatsApp', type: 'tel' },
    { key: 'email', label: 'E-mail', type: 'email' },
  ]

  if (!sessionUser) {
    nav('/login')
    return null
  }

  async function save() {
    setSubmitting(true)
    setErr('')
    const result = await updateProfile({
      name: sanitize(form.name),
      phone: sanitizePhone(form.phone),
      email: form.email ? sanitizeEmail(form.email) : undefined,
    })
    setSubmitting(false)

    if (!result.ok) {
      setErr(result.error ?? 'Nao foi possivel atualizar o perfil.')
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = form.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="page-wrap" style={{ maxWidth: 480 }}>
      <div className="section-title">Meu Perfil</div>
      <div className="section-sub">Suas informacoes pessoais</div>
      <div className="card" style={{ padding: 24 }}>
        {err && <div style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', color: '#E74C3C', padding: '8px 12px', borderRadius: 4, marginBottom: 14, fontSize: 12 }}>{err}</div>}
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#9C7A2E,#C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#080808', marginBottom: 20, fontFamily: 'Playfair Display,serif' }}>{initials}</div>
        {fields.map(field => (
          <div key={field.key} style={{ marginBottom: 13 }}>
            <label style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>{field.label}</label>
            <input className="inp" type={field.type} value={form[field.key]} onChange={event => setForm(previous => ({ ...previous, [field.key]: event.target.value }))} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <button className="btn-gold btn-sm" onClick={save} disabled={submitting}>{saved ? 'Salvo!' : submitting ? 'Salvando...' : 'Salvar'}</button>
          <button className="btn-danger" style={{ fontSize: 12 }} onClick={async () => { await logout(); nav('/') }}>Sair da Conta</button>
        </div>
        {sessionUser.lgpdAccepted && (
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--brd)', fontSize: 11, color: 'var(--t3)', lineHeight: 1.8 }}>
            Consentimento LGPD aceito: <strong style={{ color: 'var(--t2)' }}>{sessionUser.lgpdTimestamp ? new Date(sessionUser.lgpdTimestamp).toLocaleString('pt-BR') : 'Sim'}</strong><br />
            <a href="#" style={{ color: 'var(--gold)', fontSize: 11 }}>Solicitar exclusao de dados</a>
          </div>
        )}
      </div>
    </div>
  )
}
