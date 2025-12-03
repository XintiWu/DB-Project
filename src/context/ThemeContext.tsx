import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'
type Version = 'classic' | 'enhanced'

interface ThemeContextType {
  theme: Theme
  version: Version
  toggleTheme: () => void
  toggleVersion: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme')
    return (saved as Theme) || 'light'
  })

  const [version, setVersion] = useState<Version>(() => {
    const saved = localStorage.getItem('app-version')
    return (saved as Version) || 'enhanced'
  })

  useEffect(() => {
    localStorage.setItem('app-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    localStorage.setItem('app-version', version)
  }, [version])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const toggleVersion = () => {
    setVersion(prev => prev === 'classic' ? 'enhanced' : 'classic')
  }

  return (
    <ThemeContext.Provider value={{ theme, version, toggleTheme, toggleVersion }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

