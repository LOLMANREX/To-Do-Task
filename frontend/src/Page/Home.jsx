import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { taskService } from '@/services/taskService'
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react'
import { Avatar } from '@/components/Avatar'

export default function Home() {
    const { user } = useAuth()
    const { isGlass } = useTheme()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function chargerStats() {
            if (!user) return
            try {
                const donnees = await taskService.getTasksByUser(user.id)
                setTasks(donnees)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        chargerStats()
    }, [user])

    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'done').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.pseudo || user?.email?.split('@')[0] || 'Utilisateur'

    const cardBase = "p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:scale-[1.02]"
    const cardGlass = "bg-white/50 dark:bg-zinc-900/40 backdrop-blur-2xl backdrop-saturate-180 border border-white/60 dark:border-white/10 shadow-xl shadow-slate-900/5 dark:shadow-black/40 hover:bg-white/65 dark:hover:bg-zinc-900/50"
    const cardSolid = "bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700"

    const currentCardClass = `${cardBase} ${isGlass ? cardGlass : cardSolid}`

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Avatar user={user} size="xl" className={isGlass ? 'ring-4 ring-white/60 dark:ring-white/10 shadow-lg' : ''} />
                <div>
                    <h1 className={`text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 ${isGlass ? 'drop-shadow-sm' : ''}`}>
                        Bonjour, {displayName} 👋
                    </h1>
                    <p className={`mt-1 font-medium ${isGlass ? 'text-slate-700 dark:text-zinc-300 drop-shadow-sm' : 'text-slate-500 dark:text-zinc-400'}`}>
                        Voici un résumé de votre productivité aujourd'hui.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="text-sm font-medium text-slate-700 dark:text-zinc-300">Calcul des statistiques...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        <div className={currentCardClass}>
                            <div className={`p-3 rounded-xl ${isGlass ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20 shadow-inner' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                <ListTodo className="w-6 h-6" />
                            </div>
                            <div>
                                <p className={`text-sm font-semibold ${isGlass ? 'text-slate-700 dark:text-zinc-300' : 'text-slate-500 dark:text-zinc-400'}`}>Total</p>
                                <p className={`text-3xl font-extrabold text-slate-900 dark:text-zinc-50 ${isGlass ? 'drop-shadow-sm' : ''}`}>{total}</p>
                            </div>
                        </div>

                        <div className={currentCardClass}>
                            <div className={`p-3 rounded-xl ${isGlass ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 shadow-inner' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className={`text-sm font-semibold ${isGlass ? 'text-slate-700 dark:text-zinc-300' : 'text-slate-500 dark:text-zinc-400'}`}>En cours</p>
                                <p className={`text-3xl font-extrabold text-slate-900 dark:text-zinc-50 ${isGlass ? 'drop-shadow-sm' : ''}`}>{inProgress}</p>
                            </div>
                        </div>

                        <div className={currentCardClass}>
                            <div className={`p-3 rounded-xl ${isGlass ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-inner' : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className={`text-sm font-semibold ${isGlass ? 'text-slate-700 dark:text-zinc-300' : 'text-slate-500 dark:text-zinc-400'}`}>Terminées</p>
                                <p className={`text-3xl font-extrabold text-slate-900 dark:text-zinc-50 ${isGlass ? 'drop-shadow-sm' : ''}`}>{completed}</p>
                            </div>
                        </div>

                        <div className={`${isGlass ? cardGlass : cardSolid} p-5 rounded-2xl flex flex-col justify-center gap-3 transition-all duration-300 hover:scale-[1.02]`}>
                            <div className="flex items-center justify-between">
                                <p className={`text-sm font-semibold flex items-center gap-2 ${isGlass ? 'text-slate-700 dark:text-zinc-300' : 'text-slate-500 dark:text-zinc-400'}`}>
                                    <TrendingUp className="w-4 h-4" /> Progression
                                </p>
                                <span className={`text-sm font-extrabold text-slate-900 dark:text-zinc-50 ${isGlass ? 'drop-shadow-sm' : ''}`}>{completionRate}%</span>
                            </div>
                            <div className={`w-full rounded-full h-2.5 overflow-hidden ${isGlass ? 'bg-black/5 dark:bg-white/10 shadow-inner border border-white/20 dark:border-black/50' : 'bg-slate-100 dark:bg-zinc-800'}`}>
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${isGlass ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-emerald-500'}`}
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}