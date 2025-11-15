import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'
import App from './App.jsx'

// глобальная обработка ошибок
window.addEventListener('error', (event) => {
  console.error('Глобальная ошибка:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Необработанная ошибка Promise:', event.reason)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
    <App />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
