import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchMe = async () => {
        try {
            const compte = await authService.me()
            setUser(compte)
            return compte
        } catch (err) {
            setUser(null)
            return null
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMe()

        const handleUnauthorized = () => {
            setUser(null)
        }

        window.addEventListener('unauthorized', handleUnauthorized)
        return () => window.removeEventListener('unauthorized', handleUnauthorized)
    }, [])

    const login = async (email, password) => {
        const compte = await authService.login(email, password)
        setUser(compte)
        return compte
    }

    const register = async (donnees) => {
        const compte = await authService.register(donnees)
        setUser(compte)
        return compte
    }

    const updateUser = (data) => {
        setUser((prev) => (prev ? { ...prev, ...data } : data))
    }

    const logout = () => {
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, refreshUser: fetchMe }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth doit être utilisé au sein d’un AuthProvider')
    }
    return context
}