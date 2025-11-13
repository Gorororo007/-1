import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // простая валидация, для демо
    if (!username.trim() || !password.trim()) {
      setError('Заполните все поля')
      return
    }

    // просто логинимся
    login(username)
    
    // редирект после входа
    navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Gorland</h1>
          <p>Вход в аккаунт</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите имя пользователя"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="form-input"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button">
            Войти
          </button>
        </form>
        
        <div className="login-footer">
          <p>Демо-версия: любой логин и пароль</p>
        </div>
      </div>
    </div>
  )
}

export default Login

