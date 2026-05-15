import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { Service } from '@/types'
import { Plus, Edit2, X } from 'lucide-react'

const emptyService = (): Omit<Service,'id'> => ({ name:'', description:'', price:0, durationMinutes:30, active:true })

export default function AdminServices() {
  const { services, addService, updateService } = useApp()
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyService())
  const [isNew, setIsNew] = useState(false)

  function openNew() { setForm(emptyService()); setEditing(null); setIsNew(true) }
  function openEdit(s: Service) { setForm({ name:s.name, description:s.description, price:s.price, durationMinutes:s.durationMinutes, active:s.active }); setEditing(s); setIsNew(false) }
  function close() { setEditing(null); setIsNew(false) }

  function save() {
    if (!form.name.trim()) return
    if (isNew) addService({ ...form, id: `s_${Date.now()}` })
    else if (editing) updateService({ ...editing, ...form })
    close()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: 'Playfair Display,serif' }}>Serviços</h2>
          <p style={{ fontSize: 12, color: 'var(--t3)' }}>Os serviços aqui refletem no site público e no agendamento</p>
        </div>
        <button className="btn-gold btn-sm" onClick={openNew}><Plus size={13}/> Novo Serviço</button>
      </div>

      {(isNew || editing) && (
        <div className="card card-gold" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{isNew ? 'Novo Serviço' : `Editando: ${editing?.name}`}</span>
            <button onClick={close} style={{ background:'none',border:'none',color:'var(--t3)',cursor:'pointer' }}><X size={16}/></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Nome *</label>
              <input className="inp" value={form.name} maxLength={60} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Ex: Corte Masculino"/>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Descrição</label>
              <textarea className="inp" value={form.description} maxLength={200} onChange={e => setForm(p=>({...p,description:e.target.value}))} rows={2} style={{ resize:'vertical' }} placeholder="Descrição do serviço..."/>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Preço (R$) *</label>
              <input className="inp" type="number" min={0} step={0.01} value={form.price} onChange={e => setForm(p=>({...p,price:parseFloat(e.target.value)||0}))}/>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Duração (min)</label>
              <input className="inp" type="number" min={5} step={5} value={form.durationMinutes} onChange={e => setForm(p=>({...p,durationMinutes:parseInt(e.target.value)||30}))}/>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Status</label>
              <select className="inp" value={form.active ? 'true' : 'false'} onChange={e => setForm(p=>({...p,active:e.target.value==='true'}))}>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn-gold btn-sm" onClick={save}>Salvar</button>
            <button className="btn-ghost btn-sm" onClick={close}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead><tr><th>Serviço</th><th>Descrição</th><th>Preço</th><th>Duração</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td style={{ fontSize: 11, maxWidth: 200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.description}</td>
                <td style={{ color: 'var(--gold)' }}>R$ {s.price.toFixed(2)}</td>
                <td>{s.durationMinutes}min</td>
                <td><span className={`badge ${s.active ? 'badge-ok':'badge-err'}`}>{s.active?'Ativo':'Inativo'}</span></td>
                <td>
                  <div style={{ display:'flex', gap:5 }}>
                    <button className="btn-ghost btn-sm" style={{ fontSize:11 }} onClick={() => openEdit(s)}><Edit2 size={11}/> Editar</button>
                    <button className="btn-danger" style={{ fontSize:11 }} onClick={() => updateService({...s,active:!s.active})}>{s.active?'Inativar':'Ativar'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
