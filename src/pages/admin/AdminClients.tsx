import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { Search } from 'lucide-react'

export default function AdminClients() {
  const { appointments } = useApp()
  const [search, setSearch] = useState('')

  // Build unique client list from appointments
  const clientMap = new Map<string, {
    name: string; phone: string; email?: string; count: number
    last: string; lgpd: boolean; lgpdTs?: string
  }>()

  appointments.forEach(a => {
    const key = a.ownerUserId || a.ownerEmail || a.clientPhone
    const ex = clientMap.get(key)
    if (!ex || a.date > ex.last) {
      clientMap.set(key, {
        name: a.clientName, phone: a.clientPhone, email: a.clientEmail,
        count: (ex?.count || 0) + 1, last: a.date,
        lgpd: a.lgpdConsent, lgpdTs: a.consentTimestamp,
      })
    } else {
      clientMap.set(key, { ...ex, count: ex.count + 1 })
    }
  })

  const clients = Array.from(clientMap.values()).filter(c =>
    search ? c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || !!c.email?.toLowerCase().includes(search.toLowerCase()) : true
  )

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontFamily: 'Playfair Display,serif' }}>Clientes</h2>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 14 }}>Dados protegidos — visíveis apenas para administradores autenticados</p>
        <div style={{ background:'rgba(201,168,76,0.05)', border:'1px solid var(--brd-g)', borderRadius:4, padding:'8px 12px', fontSize:11, color:'var(--t2)', marginBottom:16 }}>
          🔒 Acesso restrito. Não compartilhe esta tela com terceiros não autorizados.
        </div>
      </div>

      <div style={{ position:'relative', marginBottom:16, maxWidth:320 }}>
        <Search size={13} style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--t3)' }}/>
        <input className="inp" style={{ paddingLeft:30 }} placeholder="Buscar por nome ou telefone..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          {clients.length === 0 ? (
            <div style={{ padding:32, textAlign:'center', fontSize:13, color:'var(--t3)' }}>Nenhum cliente encontrado.</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr><th>Nome</th><th>WhatsApp</th><th>E-mail</th><th>Agend.</th><th>Último</th><th>LGPD</th><th>Aceito em</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {clients.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:500 }}>{c.name}</td>
                    <td style={{ fontSize:11 }}>{c.phone}</td>
                    <td style={{ fontSize:11 }}>{c.email || '—'}</td>
                    <td>{c.count}</td>
                    <td style={{ color:'var(--gold)', fontSize:11 }}>{c.last}</td>
                    <td>
                      {c.lgpd
                        ? <span style={{ fontSize:10,color:'#2ECC71' }}>✓ Aceito</span>
                        : <span style={{ fontSize:10,color:'#E74C3C' }}>✗ Pendente</span>}
                    </td>
                    <td style={{ fontSize:10,color:'var(--t3)' }}>
                      {c.lgpdTs ? new Date(c.lgpdTs).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td>
                      <div style={{ display:'flex',gap:5 }}>
                        <button className="btn-ghost btn-sm" style={{ fontSize:10 }} onClick={()=>alert('Em produção: abre histórico completo')}>Histórico</button>
                        <button className="btn-danger" style={{ fontSize:10 }} onClick={()=>alert('Em produção: registra solicitação de exclusão LGPD')}>Excluir dados</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
