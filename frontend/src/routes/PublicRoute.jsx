import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function PublicRoute() {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                Chargement...
            </div>
        )
    }

    return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}