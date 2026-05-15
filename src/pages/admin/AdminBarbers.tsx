import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { Barber } from '@/types'
import { Plus, Edit2, X } from 'lucide-react'

const emptyBarber = (): Omit<Barber,'id'> => ({ name:'', specialty:'', description:'', photo:undefined, active:true })

export default function AdminBarbers() {
  const { barbers, addBarber, updateBarber } = useApp()
  const [editing, setEditing] = useState<Barber | null>(null)
  const [form, setForm] = useState(emptyBarber())
  const [isNew, setIsNew] = useState(false)

  function openNew() { setForm(emptyBarber()); setEditing(null); setIsNew(true) }
  function openEdit(b: Barber) { setForm({ name:b.name, specialty:b.specialty, description:b.description, photo:b.photo, active:b.active }); setEditing(b); setIsNew(false) }
  function close() { setEditing(null); setIsNew(false) }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = ev => setForm(p => ({ ...p, photo: ev.target?.result as string }))
    reader.readAsDataURL(f)
  }

  function save() {
    if (!form.name.trim()) return
    if (isNew) {
      addBarber({ ...form, id: `b_${Date.now()}` })
    } else if (editing) {
      updateBarber({ ...editing, ...form })
    }
    close()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: 'Playfair Display,serif' }}>Barbeiros</h2>
          <p style={{ fontSize: 12, color: 'var(--t3)' }}>Gerencie a equipe da barbearia</p>
        </div>
        <button className="btn-gold btn-sm" onClick={openNew}><Plus size={13}/> Novo Barbeiro</button>
      </div>

      {/* Form */}
      {(isNew || editing) && (
        <div className="card card-gold" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{isNew ? 'Novo Barbeiro' : `Editando: ${editing?.name}`}</span>
            <button onClick={close} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}><X size={16}/></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Nome *</label>
              <input className="inp" value={form.name} maxLength={60} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Nome completo"/>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Especialidade</label>
              <input className="inp" value={form.specialty} maxLength={60} onChange={e => setForm(p=>({...p,specialty:e.target.value}))} placeholder="Ex: Degradê, Barba..."/>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Descrição</label>
              <textarea className="inp" value={form.description} maxLength={200} onChange={e => setForm(p=>({...p,description:e.target.value}))} rows={2} style={{ resize: 'vertical' }} placeholder="Breve descrição..."/>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Foto (preview local)</label>
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ fontSize: 11, color: 'var(--t2)' }}/>
              {form.photo && <img src={form.photo} alt="preview" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginTop: 6, border: '1px solid var(--brd-g)' }}/>}
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
            {editing && form.photo && (
              <button className="btn-danger" style={{ fontSize: 11 }} onClick={() => setForm(p=>({...p,photo:undefined}))}>Remover foto</button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead><tr><th>Foto</th><th>Nome</th><th>Especialidade</th><th>Descrição</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {barbers.map(b => (
              <tr key={b.id}>
                <td>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg4)', border: '1px solid var(--brd-g)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 14 }}>
                    {b.photo ? <img src={b.photo} alt={b.name} style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : '👤'}
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{b.name}</td>
                <td style={{ fontSize: 11 }}>{b.specialty}</td>
                <td style={{ fontSize: 11, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.description}</td>
                <td><span className={`badge ${b.active ? 'badge-ok' : 'badge-err'}`}>{b.active ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className="btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => openEdit(b)}><Edit2 size={11}/> Editar</button>
                    <button className="btn-danger" style={{ fontSize: 11 }} onClick={() => updateBarber({ ...b, active: !b.active })}>
                      {b.active ? 'Inativar' : 'Ativar'}
                    </button>
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
