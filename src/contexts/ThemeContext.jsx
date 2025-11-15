import { createContext, useContext, useState, useEffect } from 'react'
import { themeSvc } from '../services/ThemeService.js'

const ThemeContext = createContext()

// один экземпляр сервиса темы
const themeService = new themeSvc()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const initialTheme = themeService.getTheme()
    // сразу применяем тему при загрузке
    themeService.applyTheme(initialTheme)
    return initialTheme
  })

  useEffect(() => {
    // слушаем изменения темы
    const unsubscribe = themeService.subscribe((newTheme) => {
      setTheme(newTheme)
    })

    return unsubscribe
  }, [])

  const handleSetTheme = (newTheme) => {
    themeService.setTheme(newTheme)
  }

  const toggleTheme = () => {
    themeService.toggleTheme()
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme должен использоваться внутри ThemeProvider')
  }
  return context
}

