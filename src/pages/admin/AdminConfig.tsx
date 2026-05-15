import { useEffect, useState } from 'react'
import { useApp } from '@/store/AppContext'

export default function AdminConfig() {
  const { config, setConfig } = useApp()
  const [form, setForm] = useState({ ...config })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm({ ...config })
  }, [config])

  const fields: Array<{ key: keyof typeof form; label: string; type?: string; hint?: string }> = [
    { key: 'name', label: 'Nome da Barbearia', hint: 'Exibido no menu e na home' },
    { key: 'tagline', label: 'Tagline', hint: 'Frase embaixo do nome na home' },
    { key: 'address', label: 'Endereco', hint: 'Exibido na secao de informacoes' },
    { key: 'whatsapp', label: 'WhatsApp (somente numeros)', hint: 'Ex: 5511999990000 - usado em todos os botoes WhatsApp', type: 'tel' },
    { key: 'instagram', label: 'Instagram (opcional)', hint: 'Ex: @barbeariaprime' },
    { key: 'scheduleText', label: 'Texto de Horario', hint: 'Exibido na home e footer' },
    { key: 'heroText', label: 'Texto do Hero', hint: 'Paragrafo principal da home' },
    { key: 'whatsappButtonText', label: 'Texto do Botao WhatsApp', hint: 'Label do botao na home' },
  ]

  function save() {
    setConfig({ ...form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontFamily: 'Playfair Display,serif', marginBottom: 4 }}>Configuracoes</h2>
      <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 20 }}>Edicoes aqui refletem imediatamente no site publico</p>

      <div className="card" style={{ padding: 24, maxWidth: 640 }}>
        {fields.map(field => (
          <div key={field.key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>{field.label}</label>
            <input
              className="inp"
              type={field.type || 'text'}
              value={String(form[field.key] ?? '')}
              onChange={event => setForm(previous => ({ ...previous, [field.key]: event.target.value }))}
              maxLength={field.key === 'heroText' ? 300 : 120}
            />
            {field.hint && <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 3 }}>{field.hint}</div>}
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>Intervalo entre Horarios (min)</label>
          <select className="inp" value={form.intervalMinutes} onChange={event => setForm(previous => ({ ...previous, intervalMinutes: parseInt(event.target.value, 10) }))} style={{ maxWidth: 160 }}>
            <option value={30}>30 minutos</option>
            <option value={45}>45 minutos</option>
            <option value={60}>60 minutos</option>
          </select>
        </div>

        <button className="btn-gold" onClick={save}>{saved ? 'Salvo com sucesso!' : 'Salvar Configuracoes'}</button>
      </div>

      <div className="card" style={{ padding: 20, maxWidth: 640, marginTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Lembretes e Notificacoes</div>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>
          Esta versao nao envia lembretes automaticos por WhatsApp, SMS ou e-mail. Os botoes atuais apenas abrem o canal oficial da barbearia para contato manual.
        </p>
        <div style={{ background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.25)', borderRadius: 4, padding: '10px 12px', fontSize: 12, color: '#E67E22', marginBottom: 16 }}>
          Para ativar lembretes reais, sera necessario integrar um provedor como WhatsApp Business API, Z-API ou outro servico transacional com backend agendado.
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Exemplo de mensagem para futura integracao</label>
          <textarea className="inp" rows={5} readOnly value={`Ola {nome}! Lembrando do seu horario na Barbearia Prime:\n\n- {servico}\n- Barbeiro: {barbeiro}\n- {data} as {hora}\n\nAte logo!`} style={{ resize: 'vertical', lineHeight: 1.7, fontSize: 12, opacity: 0.8 }} />
          <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>Referencia apenas: {'{nome} {servico} {barbeiro} {data} {hora}'}</div>
        </div>
      </div>
    </div>
  )
}
