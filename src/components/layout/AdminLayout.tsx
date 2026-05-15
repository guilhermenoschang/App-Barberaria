import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { LayoutDashboard, CalendarDays, Scissors, Settings, Clock, Users, ListChecks, LogOut, Bell } from 'lucide-react'
import { useState } from 'react'

const links = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={14}/>, label: 'Dashboard' },
  { to: '/admin/agenda', icon: <CalendarDays size={14}/>, label: 'Agenda' },
  { to: '/admin/barbeiros', icon: <Scissors size={14}/>, label: 'Barbeiros' },
  { to: '/admin/servicos', icon: <ListChecks size={14}/>, label: 'Serviços' },
  { to: '/admin/horarios', icon: <Clock size={14}/>, label: 'Horários' },
  { to: '/admin/clientes', icon: <Users size={14}/>, label: 'Clientes' },
  { to: '/admin/configuracoes', icon: <Settings size={14}/>, label: 'Configurações' },
]

export default function AdminLayout() {
  const { logout, notifications, markNotifRead, config } = useApp()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const unread = notifications.filter(n => !n.read).length

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 196, background: 'var(--bg1)', borderRight: '1px solid var(--brd-g)',
        position: 'fixed', top: 0, bottom: 0, left: 0, display: 'flex', flexDirection: 'column', zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--brd)' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 13, color: 'var(--gold)', marginBottom: 1 }}>{config.name}</div>
          <div style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: 1 }}>PAINEL ADMIN</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 0' }}>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9, padding: '8px 16px',
              fontSize: 12, color: isActive ? 'var(--gold)' : 'var(--t2)',
              background: isActive ? 'rgba(201,168,76,0.06)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
              textDecoration: 'none', transition: 'all 0.15s', letterSpacing: 0.2,
            })}>
              {l.icon} {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Mock banner */}
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--brd)' }}>
          <div style={{ fontSize: 10, color: '#E67E22', background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.2)', borderRadius: 3, padding: '4px 8px', textAlign: 'center' }}>
            ⚠ MVP demonstrativo
          </div>
        </div>

        {/* Logout */}
        <button onClick={async () => { await logout(); navigate('/') }} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
          background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer',
          fontSize: 12, borderTop: '1px solid var(--brd)', transition: 'color 0.15s',
        }}>
          <LogOut size={13}/> Sair
        </button>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 196, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <header style={{
          height: 48, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 20px', background: 'var(--bg1)', borderBottom: '1px solid var(--brd)',
          gap: 12, position: 'sticky', top: 0, zIndex: 40,
        }}>
          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowNotifs(!showNotifs)} style={{
              background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', position: 'relative', padding: 4,
            }}>
              <Bell size={16}/>
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0, width: 14, height: 14,
                  background: 'var(--gold)', borderRadius: '50%', fontSize: 9,
                  color: '#080808', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{unread > 9 ? '9+' : unread}</span>
              )}
            </button>
            {showNotifs && (
              <div style={{
                position: 'absolute', top: 36, right: 0, width: 300,
                background: 'var(--bg2)', border: '1px solid var(--brd-g)', borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 200, maxHeight: 360, overflow: 'auto',
              }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--brd)', fontSize: 12, fontWeight: 500, color: 'var(--t2)' }}>Notificações</div>
                {notifications.length === 0 && <div style={{ padding: 16, fontSize: 12, color: 'var(--t3)', textAlign: 'center' }}>Nenhuma notificação</div>}
                {notifications.slice(0, 20).map(n => (
                  <div key={n.id} onClick={() => markNotifRead(n.id)} style={{
                    padding: '10px 14px', borderBottom: '1px solid var(--brd)',
                    background: n.read ? 'transparent' : 'rgba(201,168,76,0.04)',
                    cursor: 'pointer', fontSize: 12, color: n.read ? 'var(--t3)' : 'var(--t1)',
                    transition: 'background 0.15s',
                  }}>
                    <div style={{ marginBottom: 2 }}>{n.message}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>{new Date(n.timestamp).toLocaleString('pt-BR')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>Administrador</div>
        </header>

        <main style={{ padding: 24, flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
