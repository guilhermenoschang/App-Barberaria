import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { BlockedSlot, Holiday } from '@/types'
import { todayStr } from '@/lib/dates'
import { generateBlockedTimeRange, validateBlockedTimeRange } from '@/lib/slots'

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const DAY_PT: Record<(typeof DAY_KEYS)[number], string> = {
  monday: 'Segunda',
  tuesday: 'Terca',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sabado',
  sunday: 'Domingo',
}

export default function AdminSchedule() {
  const { schedule, setSchedule, holidays, setHolidays, blockedSlots, setBlockedSlots, barbers, config, setConfig } = useApp()
  const [saved, setSaved] = useState(false)
  const [holidayError, setHolidayError] = useState('')
  const [blockError, setBlockError] = useState('')

  const [holForm, setHolForm] = useState<Omit<Holiday, 'id'>>({
    date: '',
    name: '',
    type: 'closed',
    openTime: '10:00',
    closeTime: '16:00',
  })

  const [blkForm, setBlkForm] = useState({
    barberId: '',
    date: todayStr(),
    startTime: '',
    endTime: '',
  })
  const [interval, setInterval] = useState(config.intervalMinutes || 60)

  useEffect(() => {
    setInterval(config.intervalMinutes || 60)
  }, [config.intervalMinutes])

  function saveSchedule() {
    setConfig({ ...config, intervalMinutes: interval })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addHoliday() {
    if (!holForm.date || !holForm.name) {
      setHolidayError('Informe data e nome do feriado.')
      return
    }
    if (holForm.type === 'reduced' && (!holForm.openTime || !holForm.closeTime || holForm.closeTime <= holForm.openTime)) {
      setHolidayError('No horario reduzido, o fechamento precisa ser maior que a abertura.')
      return
    }

    const holiday: Holiday = { ...holForm, id: `h_${Date.now()}` }
    setHolidays([...holidays, holiday])
    setHolForm({ date: '', name: '', type: 'closed', openTime: '10:00', closeTime: '16:00' })
    setHolidayError('')
  }

  function removeHoliday(id: string) {
    setHolidays(holidays.filter(holiday => holiday.id !== id))
  }

  function addBlock() {
    if (!blkForm.barberId || !blkForm.date) {
      setBlockError('Selecione barbeiro e data.')
      return
    }

    const validation = validateBlockedTimeRange(blkForm.startTime, blkForm.endTime, interval)
    if (!validation.ok) {
      setBlockError(validation.error ?? 'Intervalo invalido para bloqueio.')
      return
    }

    const times = generateBlockedTimeRange(blkForm.startTime, blkForm.endTime, interval)
    const existingTimes = new Set(
      blockedSlots
        .filter(blocked => blocked.barberId === blkForm.barberId && blocked.date === blkForm.date)
        .map(blocked => blocked.time)
    )

    const freshBlocks: BlockedSlot[] = times
      .filter(time => !existingTimes.has(time))
      .map((time, index) => ({
        id: `blk_${Date.now()}_${index}`,
        barberId: blkForm.barberId,
        date: blkForm.date,
        time,
      }))

    if (freshBlocks.length === 0) {
      setBlockError('Todos os horarios deste intervalo ja estavam bloqueados.')
      return
    }

    setBlockedSlots([...blockedSlots, ...freshBlocks])
    setBlkForm(previous => ({ ...previous, startTime: '', endTime: '' }))
    setBlockError('')
  }

  function removeBlock(id: string) {
    setBlockedSlots(blockedSlots.filter(blocked => blocked.id !== id))
  }

  function toggleDay(key: (typeof DAY_KEYS)[number]) {
    setSchedule({ ...schedule, [key]: { ...schedule[key], open: !schedule[key].open } })
  }

  function updateDayTime(key: (typeof DAY_KEYS)[number], field: 'openTime' | 'closeTime', value: string) {
    setSchedule({ ...schedule, [key]: { ...schedule[key], [field]: value } })
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontFamily: 'Playfair Display,serif', marginBottom: 4 }}>Horarios e Agenda</h2>
      <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 20 }}>Configuracoes que impactam os slots disponiveis no agendamento</p>

      <div className="card" style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Configuracao Global</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Intervalo entre horarios</label>
            <select className="inp" value={interval} onChange={event => setInterval(parseInt(event.target.value, 10))} style={{ width: 160 }}>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          </div>
          <button className="btn-gold btn-sm" onClick={saveSchedule}>{saved ? 'Salvo!' : 'Salvar'}</button>
        </div>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Dias de Funcionamento</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
          {DAY_KEYS.map(dayKey => {
            const day = schedule[dayKey]
            return (
              <div key={dayKey} style={{ background: 'var(--bg3)', border: '1px solid var(--brd)', borderRadius: 4, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{DAY_PT[dayKey]}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <div style={{ width: 32, height: 17, background: day.open ? 'var(--gold)' : 'var(--bg5)', borderRadius: 17, position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => toggleDay(dayKey)}>
                      <div style={{ width: 11, height: 11, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: day.open ? 18 : 3, transition: 'left 0.2s' }} />
                    </div>
                    <span style={{ fontSize: 11, color: day.open ? 'var(--gold)' : 'var(--t3)' }}>{day.open ? 'Aberto' : 'Fechado'}</span>
                  </label>
                </div>
                {day.open && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="time" className="inp" value={day.openTime} onChange={event => updateDayTime(dayKey, 'openTime', event.target.value)} style={{ padding: '5px 8px', fontSize: 12 }} />
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>as</span>
                    <input type="time" className="inp" value={day.closeTime} onChange={event => updateDayTime(dayKey, 'closeTime', event.target.value)} style={{ padding: '5px 8px', fontSize: 12 }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Feriados e Datas Especiais</div>
        <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 14 }}>Feriados fechados bloqueiam o dia inteiro. Horario reduzido ajusta os slots automaticamente.</p>
        {holidayError && <div style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', color: '#E74C3C', padding: '8px 12px', borderRadius: 4, marginBottom: 12, fontSize: 12 }}>{holidayError}</div>}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14 }}>
          <div><label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Data</label><input type="date" className="inp" value={holForm.date} min={todayStr()} onChange={event => setHolForm(previous => ({ ...previous, date: event.target.value }))} style={{ width: 150 }} /></div>
          <div><label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Nome</label><input className="inp" value={holForm.name} onChange={event => setHolForm(previous => ({ ...previous, name: event.target.value }))} placeholder="Ex: Corpus Christi" style={{ width: 180 }} /></div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Tipo</label>
            <select className="inp" value={holForm.type} onChange={event => setHolForm(previous => ({ ...previous, type: event.target.value as 'closed' | 'reduced' }))} style={{ width: 160 }}>
              <option value="closed">Fechado</option>
              <option value="reduced">Horario Reduzido</option>
            </select>
          </div>
          {holForm.type === 'reduced' && (
            <>
              <div><label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Abre</label><input type="time" className="inp" value={holForm.openTime} onChange={event => setHolForm(previous => ({ ...previous, openTime: event.target.value }))} style={{ width: 100 }} /></div>
              <div><label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Fecha</label><input type="time" className="inp" value={holForm.closeTime} onChange={event => setHolForm(previous => ({ ...previous, closeTime: event.target.value }))} style={{ width: 100 }} /></div>
            </>
          )}
          <button className="btn-gold btn-sm" onClick={addHoliday}><Plus size={12} /> Adicionar</button>
        </div>
        {holidays.length === 0 ? <p style={{ fontSize: 12, color: 'var(--t3)' }}>Nenhum feriado cadastrado.</p> : (
          <table className="tbl">
            <thead><tr><th>Data</th><th>Nome</th><th>Tipo</th><th>Horario</th><th></th></tr></thead>
            <tbody>
              {holidays.map(holiday => (
                <tr key={holiday.id}>
                  <td style={{ color: 'var(--gold)' }}>{holiday.date}</td>
                  <td>{holiday.name}</td>
                  <td><span className={`badge ${holiday.type === 'closed' ? 'badge-err' : 'badge-warn'}`}>{holiday.type === 'closed' ? 'Fechado' : 'Reduzido'}</span></td>
                  <td style={{ fontSize: 11 }}>{holiday.type === 'reduced' ? `${holiday.openTime}-${holiday.closeTime}` : '-'}</td>
                  <td><button onClick={() => removeHoliday(holiday.id)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}><X size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Bloqueio Manual de Horario</div>
        <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 14 }}>Agora o bloqueio pode cobrir um intervalo. Exemplo: 09:00 ate 12:00 bloqueia todos os slots intermediarios conforme o intervalo global.</p>
        {blockError && <div style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', color: '#E74C3C', padding: '8px 12px', borderRadius: 4, marginBottom: 12, fontSize: 12 }}>{blockError}</div>}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Barbeiro</label>
            <select className="inp" value={blkForm.barberId} onChange={event => setBlkForm(previous => ({ ...previous, barberId: event.target.value }))} style={{ width: 160 }}>
              <option value="">Selecione</option>
              {barbers.map(barber => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
            </select>
          </div>
          <div><label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Data</label><input type="date" className="inp" value={blkForm.date} min={todayStr()} onChange={event => setBlkForm(previous => ({ ...previous, date: event.target.value }))} style={{ width: 150 }} /></div>
          <div><label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>De</label><input type="time" className="inp" value={blkForm.startTime} onChange={event => setBlkForm(previous => ({ ...previous, startTime: event.target.value }))} style={{ width: 110 }} /></div>
          <div><label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Ate</label><input type="time" className="inp" value={blkForm.endTime} onChange={event => setBlkForm(previous => ({ ...previous, endTime: event.target.value }))} style={{ width: 110 }} /></div>
          <button className="btn-danger" onClick={addBlock}>Bloquear intervalo</button>
        </div>
        {blockedSlots.length === 0 ? <p style={{ fontSize: 12, color: 'var(--t3)' }}>Nenhum horario bloqueado manualmente.</p> : (
          <table className="tbl">
            <thead><tr><th>Barbeiro</th><th>Data</th><th>Horario</th><th></th></tr></thead>
            <tbody>
              {blockedSlots.map(blocked => {
                const barber = barbers.find(item => item.id === blocked.barberId)
                return (
                  <tr key={blocked.id}>
                    <td>{barber?.name || blocked.barberId}</td>
                    <td style={{ color: 'var(--gold)' }}>{blocked.date}</td>
                    <td>{blocked.time}</td>
                    <td><button onClick={() => removeBlock(blocked.id)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}><X size={13} /></button></td>
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
