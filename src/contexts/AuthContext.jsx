import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { db } from '../services/db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function restaurerSession() {
            try {
                const sessionUserId = localStorage.getItem('todo_session_user_id')
                if (sessionUserId) {
                    const compte = await db.users.get(sessionUserId)
                    if (compte) {
                        const { passwordHash: _, ...userSansMdp } = compte
                        setUser(userSansMdp)
                    } else {
                        localStorage.removeItem('todo_session_user_id')
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        restaurerSession()
    }, [])

    const login = async (email, password) => {
        const compte = await authService.login(email, password)
        setUser(compte)
        localStorage.setItem('todo_session_user_id', compte.id)
        return compte
    }

    const register = async (donnees) => {
        const compte = await authService.register(donnees)
        setUser(compte)
        localStorage.setItem('todo_session_user_id', compte.id)
        return compte
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('todo_session_user_id')
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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