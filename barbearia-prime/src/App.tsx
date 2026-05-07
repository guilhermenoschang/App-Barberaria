import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './store/AppContext'
import PublicLayout from './components/layout/PublicLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public pages
import Home from './pages/client/Home'
import Services from './pages/client/Services'
import Barbers from './pages/client/Barbers'
import Booking from './pages/client/Booking'
import MyAppointments from './pages/client/MyAppointments'
import Profile from './pages/client/Profile'
import Login from './pages/client/Login'
import Register from './pages/client/Register'
import Terms from './pages/client/Terms'
import Privacy from './pages/client/Privacy'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import Agenda from './pages/admin/Agenda'
import AdminBarbers from './pages/admin/AdminBarbers'
import AdminServices from './pages/admin/AdminServices'
import AdminSchedule from './pages/admin/AdminSchedule'
import AdminClients from './pages/admin/AdminClients'
import AdminConfig from './pages/admin/AdminConfig'

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useApp()
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />
}

export default function App() {
  const { theme } = useApp()
  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--bg0)', color: 'var(--t1)' }}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/barbeiros" element={<Barbers />} />
          <Route path="/agendar" element={<Booking />} />
          <Route path="/meus-agendamentos" element={<MyAppointments />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/termos-de-uso" element={<Terms />} />
          <Route path="/politica-de-privacidade" element={<Privacy />} />
        </Route>
        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="barbeiros" element={<AdminBarbers />} />
          <Route path="servicos" element={<AdminServices />} />
          <Route path="horarios" element={<AdminSchedule />} />
          <Route path="clientes" element={<AdminClients />} />
          <Route path="configuracoes" element={<AdminConfig />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
