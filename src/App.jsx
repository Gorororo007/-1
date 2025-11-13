import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Catalog from './pages/Catalog'
import Cart from './pages/Cart'
import './App.css'

function AppContent() {
  const { user } = useAuth()

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Catalog />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <div className="app">
        <AppContent />
      </div>
    </Router>
  )
}

export default App
