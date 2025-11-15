// управление темой (светлая/темная)
export class themeSvc {
  constructor() {
    this.theme = this.loadTheme()
    this.listeners = []
  }

  // просто возвращаем текущую тему
  getTheme() {
    return this.theme
  }

  // уведомляем всех что тема изменилась
  notify() {
    this.listeners.forEach(listener => listener(this.theme))
  }

  // переключаем между светлой и темной
  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light'
    this.setTheme(newTheme)
  }

  // применяем тему к html элементу
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
  }

  // устанавливаем тему (только light или dark)
  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      throw new Error('Тема должна быть "light" или "dark"')
    }
    this.theme = theme
    this.saveTheme(theme)
    this.applyTheme(theme)
    this.notify()
  }

  // подписка на изменения темы
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // сохраняем в локалсторадж
  saveTheme(theme) {
    localStorage.setItem('theme', theme)
  }

  // загружаем дефолтную
  loadTheme() {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme || 'light'
  }
}

