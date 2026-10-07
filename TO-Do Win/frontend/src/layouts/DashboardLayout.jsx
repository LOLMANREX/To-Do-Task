import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Calendar, FileText, Settings, LogOut, Monitor, Smartphone, Sun, Moon, Sparkles, Droplets, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useViewMode } from '@/contexts/ViewModeContext'
import { Avatar } from '@/components/Avatar'

function AppleLiquidCanvas({ mode }) {
    const isDark = mode === 'glass-dark'

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
            {isDark ? (
                <>
                    {/* Orb 1: Royal Indigo & Electric Cobalt (top-left) */}
                    <div className="absolute -top-40 -left-40 w-[720px] h-[720px] rounded-full blur-[125px] opacity-75 bg-gradient-to-tr from-indigo-700/50 via-blue-600/40 to-violet-800/45 animate-apple-liquid-1" />
                    {/* Orb 2: Cosmic Purple & Vivid Fuchsia (top-right) */}
                    <div className="absolute top-1/4 -right-40 w-[680px] h-[680px] rounded-full blur-[130px] opacity-70 bg-gradient-to-bl from-fuchsia-600/40 via-purple-600/45 to-indigo-600/35 animate-apple-liquid-2" />
                    {/* Orb 3: Cyber Cyan Aurora & Teal (bottom-left) */}
                    <div className="absolute -bottom-40 left-1/4 w-[760px] h-[760px] rounded-full blur-[135px] opacity-70 bg-gradient-to-tr from-cyan-500/35 via-teal-500/40 to-emerald-600/30 animate-apple-liquid-3" />
                    {/* Orb 4: Deep Sapphire Plasma (bottom-right) */}
                    <div className="absolute bottom-10 -right-20 w-[620px] h-[620px] rounded-full blur-[120px] opacity-65 bg-gradient-to-tl from-blue-600/40 via-indigo-600/35 to-purple-700/40 animate-apple-liquid-4" />
                    {/* Specular Pulsing Core */}
                    <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full blur-[90px] opacity-35 bg-gradient-to-r from-cyan-400/20 via-indigo-400/25 to-fuchsia-400/20 animate-apple-pulse" />
                </>
            ) : (
                <>
                    {/* Orb 1: Apple Electric Sky & Azure (top-left) */}
                    <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-[120px] opacity-80 bg-gradient-to-tr from-sky-400/60 via-cyan-300/50 to-blue-500/55 animate-apple-liquid-1" />
                    {/* Orb 2: Soft Orchid & Rose Blossom (top-right) */}
                    <div className="absolute top-1/4 -right-40 w-[680px] h-[680px] rounded-full blur-[125px] opacity-75 bg-gradient-to-bl from-pink-400/50 via-purple-300/45 to-rose-400/40 animate-apple-liquid-2" />
                    {/* Orb 3: Warm Solar Amber & Peach (bottom-left) */}
                    <div className="absolute -bottom-40 left-1/4 w-[740px] h-[740px] rounded-full blur-[130px] opacity-75 bg-gradient-to-tr from-amber-300/55 via-orange-300/40 to-pink-300/50 animate-apple-liquid-3" />
                    {/* Orb 4: Aquamarine & Crystal Mint (bottom-right) */}
                    <div className="absolute bottom-10 -right-20 w-[620px] h-[620px] rounded-full blur-[120px] opacity-70 bg-gradient-to-tl from-emerald-300/45 via-teal-300/45 to-sky-300/50 animate-apple-liquid-4" />
                    {/* Specular Pulsing Core */}
                    <div className="absolute top-1/3 left-1/3 w-[520px] h-[520px] rounded-full blur-[90px] opacity-60 bg-gradient-to-r from-white via-sky-100/70 to-pink-100/60 animate-apple-pulse" />
                </>
            )}

            {/* Subtle Apple optical caustic refraction sheen */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/5 mix-blend-overlay opacity-60 pointer-events-none" />
        </div>
    )
}

export default function DashboardLayout() {
    const { user, logout } = useAuth()
    const { mode, setMode, toggleTheme, isGlass } = useTheme()
    const { viewMode, setViewMode, toggleViewMode, isMobile } = useViewMode()
    const navigate = useNavigate()

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        try {
            return localStorage.getItem('sidebar_collapsed') === 'true'
        } catch {
            return false
        }
    })

    const toggleSidebar = () => {
        setIsSidebarCollapsed(prev => {
            const next = !prev
            try { localStorage.setItem('sidebar_collapsed', String(next)) } catch {}
            return next
        })
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.pseudo || user?.email?.split('@')[0] || 'Utilisateur'

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
        { path: '/tasks', icon: CheckSquare, label: 'Tâches' },
        { path: '/agenda', icon: Calendar, label: 'Agenda' },
        { path: '/editor', icon: FileText, label: 'Éditeur' },
        { path: '/settings', icon: Settings, label: 'Paramètres' }
    ]

    if (isMobile) {
        return (
            <div className={`min-h-[100dvh] w-full ${isGlass ? 'bg-transparent' : 'bg-zinc-100 dark:bg-zinc-900/50'} flex flex-col items-center justify-center p-0 sm:p-6 lg:p-8 relative font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden transition-colors duration-300`}>
                {isGlass && <AppleLiquidCanvas mode={mode} />}

                <div className="absolute top-6 right-6 z-50 hidden sm:flex items-center p-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 rounded-full shadow-sm">
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

                <div className={`relative w-full sm:w-[393px] h-[100dvh] sm:h-[852px] sm:max-h-[90vh] ${
                    isGlass
                        ? 'sm:bg-white/40 dark:sm:bg-zinc-900/40 sm:backdrop-blur-3xl sm:border sm:border-white/70 dark:sm:border-white/15 sm:shadow-[0_25px_70px_rgba(0,0,0,0.25)]'
                        : 'bg-white sm:bg-zinc-950 dark:bg-zinc-950 sm:shadow-2xl sm:ring-1 sm:ring-zinc-900/5 dark:sm:ring-white/10'
                } sm:rounded-[48px] sm:p-[8px] flex shrink-0 transition-colors duration-300 z-10`}>
                    <div className={`relative w-full h-full ${isGlass ? 'bg-transparent' : 'bg-zinc-50 dark:bg-zinc-950'} sm:rounded-[40px] overflow-hidden flex flex-col shadow-inner transition-colors duration-300`}>
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[120px] h-[32px] bg-zinc-950 rounded-full z-50 hidden sm:flex items-center justify-between px-3">
                            <div className="w-2 h-2 rounded-full bg-zinc-800/50"></div>
                        </div>

                        <header className={`pt-6 sm:pt-14 pb-4 px-6 ${
                            isGlass
                                ? 'bg-white/55 dark:bg-zinc-900/55 backdrop-blur-2xl border-b border-white/70 dark:border-white/10'
                                : 'bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900'
                        } flex justify-between items-center shrink-0 transition-colors duration-300`}>
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
                                    {mode === 'glass-light' && <Sparkles className="w-5 h-5 text-sky-500" />}
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

                        <main className={`flex-1 overflow-y-auto px-4 pt-4 pb-28 ${isGlass ? 'bg-transparent' : 'bg-zinc-50/50 dark:bg-zinc-950/50'} transition-colors duration-300`}>
                            <Outlet />
                        </main>

                        <div className="absolute bottom-6 left-6 right-6 z-40">
                            <nav className={`${
                                isGlass
                                    ? 'bg-white/75 dark:bg-zinc-900/75 backdrop-blur-3xl border border-white/80 dark:border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)]'
                                    : 'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-2xl'
                            } rounded-[24px] p-2 flex justify-between items-center transition-colors duration-300`}>
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className="flex-1"
                                    >
                                        {({ isActive }) => (
                                            <div className={`relative flex flex-col items-center justify-center h-14 rounded-2xl transition-all cursor-pointer ${isActive
                                                    ? 'text-zinc-900 dark:text-white bg-white/80 dark:bg-zinc-800/80 shadow-sm border border-zinc-200/50 dark:border-white/10'
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
        <div className={`flex h-screen w-full ${isGlass ? 'bg-transparent' : 'bg-zinc-50 dark:bg-zinc-950'} text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300 relative overflow-hidden`}>
            {isGlass && <AppleLiquidCanvas mode={mode} />}

            <aside className={`${isSidebarCollapsed ? 'w-[68px]' : 'w-64'} transition-all duration-300 ease-in-out border-r ${
                isGlass
                    ? 'border-white/70 dark:border-white/10 bg-white/55 dark:bg-zinc-900/55 backdrop-blur-3xl shadow-[4px_0_30px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_30px_rgba(0,0,0,0.4)]'
                    : 'border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950'
            } flex flex-col justify-between shrink-0 relative z-10 select-none overflow-x-hidden`}>
                <div>
                    {/* Header: Title / Burger button */}
                    <div className={`h-14 flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'} border-b ${isGlass ? 'border-white/60 dark:border-white/10' : 'border-zinc-200 dark:border-zinc-900'} transition-all`}>
                        {!isSidebarCollapsed ? (
                            <>
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <button
                                        type="button"
                                        onClick={toggleSidebar}
                                        title="Réduire le menu"
                                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                    >
                                        <PanelLeftClose className="w-4 h-4" />
                                    </button>
                                    <span className="font-bold text-sm tracking-tight truncate">To-Do Task</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleViewMode}
                                    title="Passer en vue mobile"
                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                >
                                    <Smartphone className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={toggleSidebar}
                                title="Développer le menu"
                                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <PanelLeftOpen className="w-5 h-5 text-sky-500" />
                            </button>
                        )}
                    </div>

                    {/* Nav Items */}
                    <nav className="p-2.5 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                title={isSidebarCollapsed ? item.label : undefined}
                                className={({ isActive }) =>
                                    `flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-sm font-medium transition-all group relative ${isActive
                                        ? isGlass
                                            ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 dark:bg-sky-500/20 border border-sky-400/30 shadow-sm font-semibold'
                                            : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 font-semibold'
                                        : 'text-zinc-500 hover:bg-white/50 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200'
                                    }`
                                }
                            >
                                <item.icon className="w-4 h-4 shrink-0" />
                                {!isSidebarCollapsed && (
                                    <span className="truncate">{item.label}</span>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Footer */}
                <div className={`p-2.5 border-t ${isGlass ? 'border-white/60 dark:border-white/10' : 'border-zinc-200 dark:border-zinc-900'} space-y-2.5`}>
                    {!isSidebarCollapsed ? (
                        <>
                            {/* Full theme + viewmode widget */}
                            <div className={`${isGlass ? 'bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-white/60 dark:border-white/10' : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200/60 dark:border-zinc-800/60'} p-2.5 rounded-xl border`}>
                                <div className="flex items-center justify-between mb-1.5 px-1">
                                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Thème</span>
                                </div>
                                <div className={`grid grid-cols-4 gap-1 p-1 ${isGlass ? 'bg-white/30 dark:bg-black/30 border border-white/40 dark:border-white/5' : 'bg-zinc-200/50 dark:bg-zinc-950'} rounded-lg mb-2.5`}>
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
                                        title="Apple Liquid Glass Clair"
                                        className={`flex items-center justify-center p-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${mode === 'glass-light' ? 'bg-white text-sky-600 shadow-sm border border-white ring-2 ring-sky-400/40' : 'text-zinc-500 hover:text-sky-600 dark:text-zinc-400'}`}
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('glass-dark')}
                                        title="Apple Liquid Glass Sombre"
                                        className={`flex items-center justify-center p-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${mode === 'glass-dark' ? 'bg-zinc-800 text-indigo-300 shadow-sm border border-white/20 ring-2 ring-indigo-500/40' : 'text-zinc-500 hover:text-indigo-400 dark:text-zinc-400'}`}
                                    >
                                        <Droplets className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between mb-1.5 px-1">
                                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Affichage</span>
                                </div>
                                <div className={`flex items-center ${isGlass ? 'bg-white/30 dark:bg-black/30 border border-white/40 dark:border-white/5' : 'bg-zinc-200/50 dark:bg-zinc-950'} p-1 rounded-lg`}>
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

                            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isGlass ? 'bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-white/60 dark:border-white/10' : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/60'} border`}>
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
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            {/* Compact Theme Cycle Button */}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                title={`Thème : ${mode} (cliquer pour changer)`}
                                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                {mode === 'glass-dark' && <Droplets className="w-4 h-4 text-indigo-400" />}
                                {mode === 'glass-light' && <Sparkles className="w-4 h-4 text-sky-500" />}
                                {mode === 'dark' && <Moon className="w-4 h-4 text-zinc-200" />}
                                {mode === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
                            </button>

                            {/* Compact Viewmode Button */}
                            <button
                                type="button"
                                onClick={toggleViewMode}
                                title="Passer en vue mobile"
                                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <Smartphone className="w-4 h-4" />
                            </button>

                            {/* Compact User Avatar */}
                            <div title={displayName} className="p-1 cursor-default">
                                <Avatar user={user} size="sm" />
                            </div>

                            {/* Compact Logout */}
                            <button
                                type="button"
                                onClick={handleLogout}
                                title="Déconnexion"
                                className="p-2 rounded-xl text-zinc-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            <main className={`flex-1 flex flex-col h-screen overflow-hidden ${isGlass ? 'bg-transparent' : 'bg-zinc-50 dark:bg-zinc-950'} transition-colors duration-300 relative z-10`}>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}