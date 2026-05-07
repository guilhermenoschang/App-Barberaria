import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { Holiday, BlockedSlot } from '@/types'
import { todayStr } from '@/lib/dates'
import { Plus, X } from 'lucide-react'

const DAY_KEYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAY_PT: Record<string,string> = { monday:'Segunda',tuesday:'Terça',wednesday:'Quarta',thursday:'Quinta',friday:'Sexta',saturday:'Sábado',sunday:'Domingo' }

export default function AdminSchedule() {
  const { schedule, setSchedule, holidays, setHolidays, blockedSlots, setBlockedSlots, barbers, config, setConfig } = useApp()
  const [saved, setSaved] = useState(false)

  // Holiday form
  const [holForm, setHolForm] = useState<Omit<Holiday,'id'>>({ date:'', name:'', type:'closed', openTime:'10:00', closeTime:'16:00' })

  // Block form
  const [blkForm, setBlkForm] = useState({ barberId:'', date:todayStr(), time:'' })
  const [interval, setInterval] = useState(config.intervalMinutes || 60)

  function saveSchedule() {
    setConfig({ ...config, intervalMinutes: interval })
    setSaved(true); setTimeout(()=>setSaved(false), 2000)
  }

  function addHoliday() {
    if (!holForm.date || !holForm.name) return
    const h: Holiday = { ...holForm, id: `h_${Date.now()}` }
    setHolidays([...holidays, h])
    setHolForm({ date:'', name:'', type:'closed', openTime:'10:00', closeTime:'16:00' })
  }

  function removeHoliday(id: string) { setHolidays(holidays.filter(h => h.id !== id)) }

  function addBlock() {
    if (!blkForm.barberId || !blkForm.date || !blkForm.time) return
    const b: BlockedSlot = { ...blkForm, id: `blk_${Date.now()}` }
    setBlockedSlots([...blockedSlots, b])
    setBlkForm(p => ({ ...p, time:'' }))
  }

  function removeBlock(id: string) { setBlockedSlots(blockedSlots.filter(b => b.id !== id)) }

  function toggleDay(key: string) {
    setSchedule({ ...schedule, [key]: { ...schedule[key], open: !schedule[key].open } })
  }
  function updateDayTime(key: string, field: 'openTime'|'closeTime', val: string) {
    setSchedule({ ...schedule, [key]: { ...schedule[key], [field]: val } })
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontFamily:'Playfair Display,serif', marginBottom: 4 }}>Horários & Agenda</h2>
      <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 20 }}>Configurações que impactam os slots disponíveis no agendamento</p>

      {/* Global settings */}
      <div className="card" style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform:'uppercase', letterSpacing:0.5, marginBottom: 14 }}>Configuração Global</div>
        <div style={{ display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap' }}>
          <div>
            <label style={{ fontSize:10,color:'var(--t3)',display:'block',marginBottom:4 }}>Intervalo entre horários</label>
            <select className="inp" value={interval} onChange={e => setInterval(parseInt(e.target.value))} style={{ width:160 }}>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          </div>
          <button className="btn-gold btn-sm" onClick={saveSchedule}>{saved?'✓ Salvo!':'Salvar'}</button>
        </div>
      </div>

      {/* Week schedule */}
      <div className="card" style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform:'uppercase', letterSpacing:0.5, marginBottom: 14 }}>Dias de Funcionamento</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
          {DAY_KEYS.map(k => {
            const d = schedule[k]
            return (
              <div key={k} style={{ background:'var(--bg3)', border:'1px solid var(--brd)', borderRadius:4, padding:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontSize:13, fontWeight:500 }}>{DAY_PT[k]}</span>
                  <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                    <div style={{ width:32,height:17,background:d.open?'var(--gold)':'var(--bg5)',borderRadius:17,position:'relative',transition:'background 0.2s',cursor:'pointer' }} onClick={()=>toggleDay(k)}>
                      <div style={{ width:11,height:11,background:'#fff',borderRadius:'50%',position:'absolute',top:3,left:d.open?18:3,transition:'left 0.2s' }}/>
                    </div>
                    <span style={{ fontSize:11,color:d.open?'var(--gold)':'var(--t3)' }}>{d.open?'Aberto':'Fechado'}</span>
                  </label>
                </div>
                {d.open && (
                  <div style={{ display:'flex',gap:6,alignItems:'center' }}>
                    <input type="time" className="inp" value={d.openTime} onChange={e=>updateDayTime(k,'openTime',e.target.value)} style={{ padding:'5px 8px',fontSize:12 }}/>
                    <span style={{ fontSize:11,color:'var(--t3)' }}>às</span>
                    <input type="time" className="inp" value={d.closeTime} onChange={e=>updateDayTime(k,'closeTime',e.target.value)} style={{ padding:'5px 8px',fontSize:12 }}/>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Holidays */}
      <div className="card" style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gold)', textTransform:'uppercase', letterSpacing:0.5, marginBottom: 14 }}>🗓 Feriados & Datas Especiais</div>
        <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 14 }}>Feriados fechados bloqueiam o dia inteiro. Horário reduzido ajusta os slots automaticamente.</p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end', marginBottom:14 }}>
          <div><label style={{ fontSize:10,color:'var(--t3)',display:'block',marginBottom:4 }}>Data</label><input type="date" className="inp" value={holForm.date} min={todayStr()} onChange={e=>setHolForm(p=>({...p,date:e.target.value}))} style={{ width:150 }}/></div>
          <div><label style={{ fontSize:10,color:'var(--t3)',display:'block',marginBottom:4 }}>Nome</label><input className="inp" value={holForm.name} onChange={e=>setHolForm(p=>({...p,name:e.target.value}))} placeholder="Ex: Corpus Christi" style={{ width:180 }}/></div>
          <div>
            <label style={{ fontSize:10,color:'var(--t3)',display:'block',marginBottom:4 }}>Tipo</label>
            <select className="inp" value={holForm.type} onChange={e=>setHolForm(p=>({...p,type:e.target.value as 'closed'|'reduced'}))} style={{ width:160 }}>
              <option value="closed">Fechado</option>
              <option value="reduced">Horário Reduzido</option>
            </select>
          </div>
          {holForm.type==='reduced' && (
            <>
              <div><label style={{ fontSize:10,color:'var(--t3)',display:'block',marginBottom:4 }}>Abre</label><input type="time" className="inp" value={holForm.openTime} onChange={e=>setHolForm(p=>({...p,openTime:e.target.value}))} style={{ width:100 }}/></div>
              <div><label style={{ fontSize:10,color:'var(--t3)',display:'block',marginBottom:4 }}>Fecha</label><input type="time" className="inp" value={holForm.closeTime} onChange={e=>setHolForm(p=>({...p,closeTime:e.target.value}))} style={{ width:100 }}/></div>
            </>
          )}
          <button className="btn-gold btn-sm" onClick={addHoliday}><Plus size={12}/> Adicionar</button>
        </div>
        {holidays.length === 0 ? <p style={{ fontSize:12,color:'var(--t3)' }}>Nenhum feriado cadastrado.</p> : (
          <table className="tbl">
            <thead><tr><th>Data</th><th>Nome</th><th>Tipo</th><th>Horário</th><th></th></tr></thead>
            <tbody>
              {holidays.map(h => (
                <tr key={h.id}>
                  <td style={{ color:'var(--gold)' }}>{h.date}</td>
                  <td>{h.name}</td>
                  <td><span className={`badge ${h.type==='closed'?'badge-err':'badge-warn'}`}>{h.type==='closed'?'Fechado':'Reduzido'}</span></td>
                  <td style={{ fontSize:11 }}>{h.type==='reduced'?`${h.openTime}–${h.closeTime}`:'—'}</td>
                  <td><button onClick={()=>removeHoliday(h.id)} style={{ background:'none',border:'none',color:'var(--t3)',cursor:'pointer' }}><X size={13}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Blocked slots */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform:'uppercase', letterSpacing:0.5, marginBottom: 14 }}>Bloqueio Manual de Horário</div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end', marginBottom:14 }}>
          <div>
            <label style={{ fontSize:10,color:'var(--t3)',display:'block',marginBottom:4 }}>Barbeiro</label>
            <select className="inp" value={blkForm.barberId} onChange={e=>setBlkForm(p=>({...p,barberId:e.target.value}))} style={{ width:160 }}>
              <option value="">Selecione</option>
              {barbers.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div><label style={{ fontSize:10,color:'var(--t3)',display:'block',marginBottom:4 }}>Data</label><input type="date" className="inp" value={blkForm.date} min={todayStr()} onChange={e=>setBlkForm(p=>({...p,date:e.target.value}))} style={{ width:150 }}/></div>
          <div><label style={{ fontSize:10,color:'var(--t3)',display:'block',marginBottom:4 }}>Horário</label><input type="time" className="inp" value={blkForm.time} onChange={e=>setBlkForm(p=>({...p,time:e.target.value}))} style={{ width:110 }}/></div>
          <button className="btn-danger" onClick={addBlock}>Bloquear</button>
        </div>
        {blockedSlots.length === 0 ? <p style={{ fontSize:12,color:'var(--t3)' }}>Nenhum horário bloqueado manualmente.</p> : (
          <table className="tbl">
            <thead><tr><th>Barbeiro</th><th>Data</th><th>Horário</th><th></th></tr></thead>
            <tbody>
              {blockedSlots.map(b => {
                const brb = barbers.find(x=>x.id===b.barberId)
                return (
                  <tr key={b.id}>
                    <td>{brb?.name || b.barberId}</td>
                    <td style={{ color:'var(--gold)' }}>{b.date}</td>
                    <td>{b.time}</td>
                    <td><button onClick={()=>removeBlock(b.id)} style={{ background:'none',border:'none',color:'var(--t3)',cursor:'pointer' }}><X size={13}/></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
