import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { Scissors, Clock, MapPin, ChevronRight, MessageCircle } from 'lucide-react'
import { openBarberiaWhatsApp } from '@/lib/whatsapp'

export default function Home() {
  const { config, services, barbers } = useApp()
  const nav = useNavigate()
  const activeServices = services.filter(s => s.active).slice(0, 5)
  const activeBarbers = barbers.filter(b => b.active)

  return (
    <div>
      {/* HERO */}
      <section style={{
        minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 20px 40px',
        background: 'radial-gradient(ellipse at 50% 70%, rgba(201,168,76,0.07) 0%, transparent 65%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg,transparent,transparent 55px,rgba(201,168,76,0.025) 55px,rgba(201,168,76,0.025) 56px),repeating-linear-gradient(90deg,transparent,transparent 55px,rgba(201,168,76,0.025) 55px,rgba(201,168,76,0.025) 56px)',
        }}/>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase', border: '1px solid var(--brd-g)', display: 'inline-block', padding: '3px 14px', marginBottom: 16 }}>Barbearia Premium</div>
          <h1 style={{ fontSize: 'clamp(32px,6vw,50px)', lineHeight: 1.1, marginBottom: 10 }}>
            {config.name.split(' ')[0]} <span style={{ color: 'var(--gold)' }}>{config.name.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>{config.tagline}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-gold" onClick={() => nav('/agendar')}>
              <Scissors size={14}/> Agendar Agora
            </button>
            <button className="btn-outline" onClick={() => openBarberiaWhatsApp(config)}>
              <MessageCircle size={14}/> {config.whatsappButtonText}
            </button>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="page-wrap">
        <div className="section-tag">O Que Oferecemos</div>
        <div className="section-title">Nossos Serviços</div>
        <div className="section-sub">Qualidade premium em cada detalhe</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
          {activeServices.map(s => (
            <div key={s.id} className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => nav('/agendar')}>
              <div style={{ width: 34, height: 34, background: 'rgba(201,168,76,0.08)', border: '1px solid var(--brd-g)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, fontSize: 16 }}>✂</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{s.name}</div>
              <p style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.5, marginBottom: 10 }}>{s.description.slice(0,60)}…</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 500, fontSize: 14 }}>R$ {s.price}</span>
                <span style={{ fontSize: 10, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10}/> {s.durationMinutes}min</span>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-ghost btn-sm" onClick={() => nav('/servicos')} style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          Ver todos os serviços <ChevronRight size={13}/>
        </button>
      </section>

      <div className="divider" style={{ margin: '0 20px' }}/>

      {/* BARBERS */}
      <section className="page-wrap">
        <div className="section-tag">Nossa Equipe</div>
        <div className="section-title">Barbeiros</div>
        <div className="section-sub">Profissionais especializados prontos para te atender</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {activeBarbers.map(b => (
            <div key={b.id} className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: b.photo ? 'transparent' : 'var(--bg4)', border: '2px solid var(--gold-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24, overflow: 'hidden' }}>
                {b.photo ? <img src={b.photo} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : '👤'}
              </div>
              <h3 style={{ fontFamily: 'DM Sans', fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{b.name}</h3>
              <p style={{ fontSize: 11, color: 'var(--gold)', marginBottom: 6 }}>{b.specialty}</p>
              <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5, marginBottom: 12 }}>{b.description.slice(0,60)}…</p>
              <button className="btn-outline btn-sm" style={{ width: '100%' }} onClick={() => nav('/agendar')}>Agendar</button>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" style={{ margin: '0 20px' }}/>

      {/* INFO */}
      <section className="page-wrap" style={{ paddingBottom: 36 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 0, background: 'var(--bg2)', border: '1px solid var(--brd-g)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ padding: '20px 16px', textAlign: 'center', borderRight: '1px solid var(--brd)' }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 7 }}>Endereço</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><MapPin size={12}/> {config.address}</div>
          </div>
          <div style={{ padding: '20px 16px', textAlign: 'center', borderRight: '1px solid var(--brd)' }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 7 }}>Horário</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.7 }}>{config.scheduleText}</div>
          </div>
          <div style={{ padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 7 }}>Contato</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.7 }}>{config.instagram || 'WhatsApp disponível'}</div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 32, padding: '24px', background: 'var(--bg2)', border: '1px solid var(--brd-g)', borderRadius: 4 }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Pronto para se cuidar?</h2>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 20 }}>Agende agora em menos de 2 minutos.</p>
          <button className="btn-gold" onClick={() => nav('/agendar')}>
            <Scissors size={14}/> Agendar Meu Horário
          </button>
        </div>
      </section>
    </div>
  )
}
