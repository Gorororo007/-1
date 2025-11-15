import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const validateEmail = (email) => {
    return email.includes('@') && email.includes('.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // валидация полей
    if (!email.trim() || !password.trim()) {
      setError('Заполните все обязательные поля')
      setLoading(false)
      return
    }

    if (!validateEmail(email)) {
      setError('Введите корректный email')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      setLoading(false)
      return
    }

    // валидация для регистрации
    if (isRegister) {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Заполните имя и фамилию')
        setLoading(false)
        return
      }
    }

    try {
      if (isRegister) {
        // регистрация через api
        const result = await register({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          password: password,
          phone: phone.trim() || null
        })
        
        if (result.success) {
          navigate('/dashboard')
        } else {
          setError(result.error || 'Ошибка регистрации')
        }
      } else {
        // вход через api
        const result = await login(email, password)
        
        if (result.success) {
    navigate('/dashboard')
        } else {
          setError(result.error || 'Ошибка входа')
        }
      }
    } catch (err) {
      setError(err.message || 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsRegister(!isRegister)
    setError('')
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setPhone('')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Gorland</h1>
          <p>{isRegister ? 'Регистрация' : 'Вход в аккаунт'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Имя *</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Введите имя"
                    className="form-input"
                    required
                  />
                </div>
          <div className="form-group">
                  <label htmlFor="lastName">Фамилия *</label>
            <input
              type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Введите фамилию"
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Телефон</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Введите телефон (необязательно)"
              className="form-input"
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль *</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль (мин. 6 символов)"
              className="form-input"
              required
              minLength={6}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading 
              ? (isRegister ? 'Регистрация...' : 'Вход...') 
              : (isRegister ? 'Зарегистрироваться' : 'Войти')}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            {isRegister ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
            <button 
              type="button" 
              onClick={switchMode} 
              className="link-button"
            >
              {isRegister ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

