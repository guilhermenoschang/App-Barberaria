import { useState } from 'react'
import { useApp } from '@/store/AppContext'

export default function AdminConfig() {
  const { config, setConfig } = useApp()
  const [form, setForm] = useState({ ...config })
  const [saved, setSaved] = useState(false)

  function save() {
    setConfig({ ...form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const fields: Array<{ key: keyof typeof form; label: string; type?: string; hint?: string }> = [
    { key:'name', label:'Nome da Barbearia', hint:'Exibido no menu e na home' },
    { key:'tagline', label:'Tagline', hint:'Frase embaixo do nome na home' },
    { key:'address', label:'Endereço', hint:'Exibido na seção de informações' },
    { key:'whatsapp', label:'WhatsApp (somente números)', hint:'Ex: 5511999990000 — usado em todos os botões WhatsApp', type:'tel' },
    { key:'instagram', label:'Instagram (opcional)', hint:'Ex: @barbeariaprime' },
    { key:'scheduleText', label:'Texto de Horário', hint:'Exibido na home e footer' },
    { key:'heroText', label:'Texto do Hero', hint:'Parágrafo principal da home' },
    { key:'whatsappButtonText', label:'Texto do Botão WhatsApp', hint:'Label do botão na home' },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 20, fontFamily:'Playfair Display,serif', marginBottom: 4 }}>Configurações</h2>
      <p style={{ fontSize: 12, color:'var(--t3)', marginBottom: 20 }}>Edições aqui refletem imediatamente no site público</p>

      <div className="card" style={{ padding: 24, maxWidth: 640 }}>
        {fields.map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color:'var(--t3)', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom: 4 }}>{f.label}</label>
            <input className="inp" type={f.type || 'text'} value={(form as any)[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} maxLength={f.key === 'heroText' ? 300 : 120}/>
            {f.hint && <div style={{ fontSize: 10, color:'var(--t3)', marginTop: 3 }}>{f.hint}</div>}
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color:'var(--t3)', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom: 4 }}>Intervalo entre Horários (min)</label>
          <select className="inp" value={form.intervalMinutes} onChange={e => setForm(p => ({ ...p, intervalMinutes: parseInt(e.target.value) }))} style={{ maxWidth: 160 }}>
            <option value={30}>30 minutos</option>
            <option value={45}>45 minutos</option>
            <option value={60}>60 minutos</option>
          </select>
        </div>

        <button className="btn-gold" onClick={save}>{saved ? '✓ Salvo com sucesso!' : 'Salvar Configurações'}</button>
      </div>

      {/* Notification settings */}
      <div className="card" style={{ padding: 20, maxWidth: 640, marginTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight:500, color:'var(--t2)', textTransform:'uppercase', letterSpacing:0.5, marginBottom: 16 }}>Lembretes & Notificações (Simulado)</div>
        <p style={{ fontSize: 12, color:'var(--t3)', marginBottom: 16 }}>Em produção, conectar com WhatsApp Business API ou Z-API. Abaixo, configure o modelo de lembrete.</p>
        {[
          { label:'Lembrete antes do atendimento', def:'2 horas antes', options:['30 min antes','1 hora antes','2 horas antes','1 dia antes','1 dia + 2h antes'] },
        ].map(n => (
          <div key={n.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--brd)' }}>
            <span style={{ fontSize:13 }}>{n.label}</span>
            <select className="inp" defaultValue={n.def} style={{ maxWidth:180 }}>
              {n.options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize:11, color:'var(--t3)', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:6 }}>Mensagem de Lembrete (modelo)</label>
          <textarea className="inp" rows={5} defaultValue={`Olá {nome}! 👋 Lembrando do seu horário na Barbearia Prime:\n\n✂ {servico}\n👤 Barbeiro: {barbeiro}\n📅 {data} às {hora}\n\nAté logo!`} style={{ resize:'vertical', lineHeight:1.7, fontSize:12 }}/>
          <div style={{ fontSize:10, color:'var(--t3)', marginTop:4 }}>Variáveis: {'{nome} {servico} {barbeiro} {data} {hora}'}</div>
        </div>
      </div>
    </div>
  )
}
