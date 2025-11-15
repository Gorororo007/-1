// управление авторизацией
export class authSvc {
  constructor() {
    this.user = this.loadUser()
    this.listeners = []
  }

  // проверяем залогинен ли
  isAuthenticated() {
    return this.user !== null
  }

  // уведомляем всех что пользователь изменился
  notify() {
    this.listeners.forEach(listener => listener(this.user))
  }

  // возвращаем текущего пользователя
  getUser() {
    return this.user
  }

  // разлогиниваем
  logout() {
    this.user = null
    this.saveUser(null)
    this.notify()
  }

  // логиним пользователя
  login(username) {
    const userData = {
      username,
      loginTime: new Date().toISOString()
    }
    this.user = userData
    this.saveUser(userData)
    this.notify()
  }

  // подписка на изменения авторизации
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // сохраняем или удаляем пользователя
  saveUser(user) {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }

  // загружаем пользователя из локалстораджа
  loadUser() {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  }
}

