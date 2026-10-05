import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Calendar, Settings, LogOut, Monitor, Smartphone, Sun, Moon, Sparkles, Droplets } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useViewMode } from '@/contexts/ViewModeContext'
import { Avatar } from '@/components/Avatar'

export default function DashboardLayout() {
    const { user, logout } = useAuth()
    const { mode, setMode, toggleTheme, isGlass } = useTheme()
    const { viewMode, setViewMode, toggleViewMode, isMobile } = useViewMode()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.pseudo || user?.email?.split('@')[0] || 'Utilisateur'

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
        { path: '/tasks', icon: CheckSquare, label: 'Tâches' },
        { path: '/agenda', icon: Calendar, label: 'Agenda' },
        { path: '/settings', icon: Settings, label: 'Paramètres' }
    ]

    if (isMobile) {
        return (
            <div className="min-h-[100dvh] w-full bg-zinc-100 dark:bg-zinc-900/50 flex flex-col items-center justify-center p-0 sm:p-6 lg:p-8 relative font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden transition-colors duration-300">
                {isGlass && (
                    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                        <div className={`absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[100px] opacity-70 animate-liquid-1 ${mode === 'glass-dark' ? 'bg-indigo-600/35' : 'bg-sky-300/50'}`} />
                        <div className={`absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full blur-[110px] opacity-60 animate-liquid-2 ${mode === 'glass-dark' ? 'bg-fuchsia-600/30' : 'bg-pink-300/45'}`} />
                        <div className={`absolute -bottom-32 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-60 animate-liquid-1 ${mode === 'glass-dark' ? 'bg-teal-500/30' : 'bg-amber-200/45'}`} />
                    </div>
                )}

                <div className="absolute top-6 right-6 z-50 hidden sm:flex items-center p-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm">
                    <button
                        type="button"
                        onClick={() => setViewMode('desktop')}
                        className="px-4 py-1.5 rounded-full text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <Monitor className="w-4 h-4" /> PC
                    </button>
                    <button
                        type="button"
                        className="px-4 py-1.5 rounded-full text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow flex items-center gap-2 cursor-default"
                    >
                        <Smartphone className="w-4 h-4" /> Mobile
                    </button>
                </div>

                <div className="relative w-full sm:w-[393px] h-[100dvh] sm:h-[852px] sm:max-h-[90vh] bg-white sm:bg-zinc-950 dark:bg-zinc-950 sm:rounded-[48px] sm:shadow-2xl sm:p-[8px] flex shrink-0 sm:ring-1 sm:ring-zinc-900/5 dark:sm:ring-white/10 transition-colors duration-300 z-10">
                    <div className="relative w-full h-full bg-zinc-50 dark:bg-zinc-950 sm:rounded-[40px] overflow-hidden flex flex-col shadow-inner transition-colors duration-300">
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[120px] h-[32px] bg-zinc-950 rounded-full z-50 hidden sm:flex items-center justify-between px-3">
                            <div className="w-2 h-2 rounded-full bg-zinc-800/50"></div>
                        </div>

                        <header className="pt-6 sm:pt-14 pb-4 px-6 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center shrink-0 transition-colors duration-300">
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">To-Do Task</h1>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Avatar user={user} size="md" />
                                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[90px]">{displayName}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    title="Changer de thème"
                                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                                >
                                    {mode === 'glass-dark' && <Droplets className="w-5 h-5 text-indigo-400" />}
                                    {mode === 'glass-light' && <Sparkles className="w-5 h-5 text-blue-500" />}
                                    {mode === 'dark' && <Moon className="w-5 h-5 text-zinc-200" />}
                                    {mode === 'light' && <Sun className="w-5 h-5 text-amber-500" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    title="Déconnexion"
                                    className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </header>

                        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28 bg-zinc-50/50 dark:bg-zinc-950/50 transition-colors duration-300">
                            <Outlet />
                        </main>

                        <div className="absolute bottom-6 left-6 right-6 z-40">
                            <nav className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-2xl rounded-[24px] p-2 flex justify-between items-center transition-colors duration-300">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className="flex-1"
                                    >
                                        {({ isActive }) => (
                                            <div className={`relative flex flex-col items-center justify-center h-14 rounded-2xl transition-all cursor-pointer ${isActive
                                                    ? 'text-zinc-900 dark:text-white bg-zinc-100/80 dark:bg-zinc-800/80 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50'
                                                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50'
                                                }`}>
                                                <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                                <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
                                            </div>
                                        )}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>
                        
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full hidden sm:block z-50"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300 relative overflow-hidden">
            {isGlass && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[110px] opacity-70 animate-liquid-1 ${mode === 'glass-dark' ? 'bg-indigo-600/35' : 'bg-sky-300/50'}`} />
                    <div className={`absolute top-1/4 -right-32 w-[650px] h-[650px] rounded-full blur-[120px] opacity-60 animate-liquid-2 ${mode === 'glass-dark' ? 'bg-purple-600/30' : 'bg-pink-300/45'}`} />
                    <div className={`absolute -bottom-32 left-1/3 w-[700px] h-[700px] rounded-full blur-[130px] opacity-60 animate-liquid-1 ${mode === 'glass-dark' ? 'bg-teal-500/30' : 'bg-amber-200/45'}`} />
                </div>
            )}

            <aside className="w-64 border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex flex-col justify-between shrink-0 transition-colors duration-300 relative z-10">
                <div>
                    <div className="h-14 flex items-center justify-between px-5 border-b border-zinc-200 dark:border-zinc-900">
                        <span className="font-semibold text-sm tracking-tight">To-Do Task</span>
                        <button
                            type="button"
                            onClick={toggleViewMode}
                            title="Passer en vue mobile"
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                        >
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>

                    <nav className="p-3 space-y-0.5">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
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

                <div className="p-3 border-t border-zinc-200 dark:border-zinc-900 space-y-3">
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                        <div className="flex items-center justify-between mb-1.5 px-1">
                            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Thème</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-200/50 dark:bg-zinc-950 p-1 rounded-lg mb-2.5">
                            <button
                                type="button"
                                onClick={() => setMode('light')}
                                title="Clair"
                                className={`flex items-center justify-center p-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${mode === 'light' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}
                            >
                                <Sun className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('dark')}
                                title="Sombre"
                                className={`flex items-center justify-center p-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${mode === 'dark' ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}
                            >
                                <Moon className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('glass-light')}
                                title="Liquid Glass Clair"
                                className={`flex items-center justify-center p-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${mode === 'glass-light' ? 'bg-white text-sky-600 shadow-sm border border-sky-200 ring-1 ring-sky-400/40' : 'text-zinc-500 hover:text-sky-600 dark:text-zinc-400'}`}
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('glass-dark')}
                                title="Liquid Glass Sombre"
                                className={`flex items-center justify-center p-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${mode === 'glass-dark' ? 'bg-zinc-800 text-indigo-400 shadow-sm border border-indigo-500/50 ring-1 ring-indigo-500/40' : 'text-zinc-500 hover:text-indigo-400 dark:text-zinc-400'}`}
                            >
                                <Droplets className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between mb-1.5 px-1">
                            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Affichage</span>
                        </div>
                        <div className="flex items-center bg-zinc-200/50 dark:bg-zinc-950 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setViewMode('desktop')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${viewMode === 'desktop'
                                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                                    }`}
                            >
                                <Monitor className="w-3.5 h-3.5" /> PC
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('mobile')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${viewMode === 'mobile'
                                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                                    }`}
                            >
                                <Smartphone className="w-3.5 h-3.5" /> Mobile
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                        <Avatar user={user} size="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">{displayName}</p>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 relative z-10">
                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}