import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { Scissors, Menu, X, Sun, Moon, Layers } from 'lucide-react'
import { useState } from 'react'

export default function PublicLayout() {
  const { theme, setTheme, sessionUser, isAdmin, logout, config } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const themes: Array<{ val: typeof theme; icon: React.ReactNode; label: string }> = [
    { val: 'dark', icon: <Moon size={13}/>, label: 'Dark' },
    { val: 'gray', icon: <Layers size={13}/>, label: 'Cinza' },
    { val: 'light', icon: <Sun size={13}/>, label: 'Light' },
  ]

  const navLinks = [
    { to: '/servicos', label: 'Serviços' },
    { to: '/barbeiros', label: 'Barbeiros' },
    { to: '/agendar', label: 'Agendar' },
  ]

  const isActive = (to: string) => location.pathname === to

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        background: theme === 'light' ? 'rgba(240,237,230,0.95)' : 'rgba(8,8,8,0.95)',
        borderBottom: '1px solid var(--brd-g)',
        backdropFilter: 'blur(16px)',
      }}>
        {/* Logo */}
        <Link to="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: 'var(--gold)', letterSpacing: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Scissors size={16} style={{ color: 'var(--gold)' }} />
          <span style={{ color: 'var(--t1)' }}>{config.name}</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex" style={{ gap: 4, alignItems: 'center' }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{
              fontSize: 12, padding: '5px 12px', borderRadius: 4, textDecoration: 'none',
              color: isActive(l.to) ? 'var(--gold)' : 'var(--t2)',
              background: isActive(l.to) ? 'rgba(201,168,76,0.08)' : 'transparent',
              transition: 'all 0.15s',
              letterSpacing: 0.3,
            }}>{l.label}</Link>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme switcher */}
          <div style={{ display: 'flex', background: 'var(--bg3)', border: '1px solid var(--brd)', borderRadius: 4, padding: 2, gap: 1 }}>
            {themes.map(t => (
              <button key={t.val} onClick={() => setTheme(t.val)} title={t.label} style={{
                background: theme === t.val ? 'var(--gold)' : 'transparent',
                color: theme === t.val ? '#080808' : 'var(--t3)',
                border: 'none', cursor: 'pointer', padding: '3px 8px',
                borderRadius: 3, fontSize: 11, display: 'flex', alignItems: 'center', gap: 3,
                transition: 'all 0.15s',
              }}>
                {t.icon}
                <span style={{ display: 'none' }} className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Auth */}
          {sessionUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link to="/meus-agendamentos" style={{ fontSize: 12, color: 'var(--t2)', textDecoration: 'none' }}>
                Agendamentos
              </Link>
              <div onClick={() => navigate('/perfil')} style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer',
                border: '1px solid var(--gold)',
              }}>
                {sessionUser.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
              </div>
            </div>
          ) : isAdmin ? (
            <Link to="/admin/dashboard" style={{ fontSize: 12, color: 'var(--gold)', textDecoration: 'none' }}>Painel Admin</Link>
          ) : (
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-ghost btn-sm" onClick={() => navigate('/admin/login')}>Admin</button>
              <button className="btn-gold btn-sm" onClick={() => navigate('/login')}>Entrar</button>
            </div>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', display: 'flex' }} className="md:hidden">
            {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 52, left: 0, right: 0, zIndex: 99,
          background: 'var(--bg1)', borderBottom: '1px solid var(--brd-g)', padding: 16,
        }} className="md:hidden">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} style={{
              display: 'block', padding: '10px 0', color: isActive(l.to) ? 'var(--gold)' : 'var(--t2)',
              textDecoration: 'none', fontSize: 14, borderBottom: '1px solid var(--brd)',
            }}>{l.label}</Link>
          ))}
          {sessionUser && <button onClick={async () => { await logout(); setMobileOpen(false) }} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: '10px 0', fontSize: 13 }}>Sair</button>}
        </div>
      )}

      {/* Content */}
      <main style={{ paddingTop: 52, flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--brd)', padding: '20px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.8 }}>
          © {new Date().getFullYear()} {config.name} · {config.address}<br/>
          <Link to="/termos-de-uso" style={{ color: 'var(--t3)' }}>Termos de Uso</Link>
          {' · '}
          <Link to="/politica-de-privacidade" style={{ color: 'var(--t3)' }}>Política de Privacidade</Link>
        </p>
      </footer>
    </div>
  )
}
