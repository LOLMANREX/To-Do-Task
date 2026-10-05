import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Calendar, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
        { path: '/tasks', icon: CheckSquare, label: 'Tâches' },
        { path: '/agenda', icon: Calendar, label: 'Agenda' },
        { path: '/settings', icon: Settings, label: 'Paramètres' }
    ]

    return (
        <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
            <aside className="w-64 border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex flex-col justify-between">
                <div>
                    <div className="h-14 flex items-center px-5 border-b border-zinc-200 dark:border-zinc-900">
                        <span className="font-semibold text-sm tracking-tight">To-Do Task</span>
                    </div>

                    <nav className="p-3 space-y-0.5">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-none ${isActive
                                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50'
                                        : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200'
                                    }`
                                }
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="p-3 border-t border-zinc-200 dark:border-zinc-900">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="h-7 w-7 rounded bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 transition-none cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}