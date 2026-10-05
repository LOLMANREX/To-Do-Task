import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
    const [mode, setModeState] = useState(localStorage.getItem('todo_mode') || 'light')

    const applyTheme = (newMode) => {
        const root = window.document.documentElement
        root.classList.add('theme-transitioning')
        root.classList.remove('light', 'dark')
        root.classList.add(newMode)
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
        setMode(mode === 'light' ? 'dark' : 'light')
    }

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(mode)
    }, [])

    return (
        <ThemeContext.Provider value={{ mode, setMode, toggleTheme, isGlass: false }}>
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