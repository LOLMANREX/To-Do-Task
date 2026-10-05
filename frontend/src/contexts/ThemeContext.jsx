import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
    const [mode, setModeState] = useState(localStorage.getItem('todo_mode') || 'light')

    const applyTheme = (newMode) => {
        const root = window.document.documentElement
        root.classList.add('theme-transitioning')
        
        root.classList.remove('light', 'dark', 'glass-light', 'glass-dark')

        if (newMode === 'glass-light') {
            root.classList.add('light', 'glass-light')
        } else if (newMode === 'glass-dark') {
            root.classList.add('dark', 'glass-dark')
        } else if (newMode === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.add('light')
        }

        localStorage.setItem('todo_mode', newMode)
        setTimeout(() => {
            root.classList.remove('theme-transitioning')
        }, 450)
    }

    const setMode = (newMode) => {
        if (newMode === mode) return
        if (typeof document !== 'undefined' && document.startViewTransition) {
            document.startViewTransition(() => {
                applyTheme(newMode)
                setModeState(newMode)
            })
        } else {
            applyTheme(newMode)
            setModeState(newMode)
        }
    }

    const toggleTheme = () => {
        const sequence = ['light', 'dark', 'glass-light', 'glass-dark']
        const currentIndex = sequence.indexOf(mode)
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % sequence.length
        setMode(sequence[nextIndex])
    }

    useEffect(() => {
        applyTheme(mode)
    }, [])

    const isGlass = mode === 'glass-light' || mode === 'glass-dark'
    const isDark = mode === 'dark' || mode === 'glass-dark'

    return (
        <ThemeContext.Provider value={{ mode, setMode, toggleTheme, isGlass, isDark }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('Erreur context')
    }
    return context
}