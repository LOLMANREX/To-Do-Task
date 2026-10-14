import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Calendar } from 'lucide-react'
import { taskService } from '@/services/taskService'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

export default function Agenda() {
    const { user } = useAuth()
    const { isGlass } = useTheme()
    const [tasks, setTasks] = useState([])
    const [currentDate, setCurrentDate] = useState(new Date())

    const [modalOpen, setModalOpen] = useState(false)
    const [editingTaskId, setEditingTaskId] = useState(null)
    const [selectedDate, setSelectedDate] = useState('')
    const [time, setTime] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState('todo')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const todayStr = new Date().toISOString().split('T')[0]

    const cardGlass = "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-3xl backdrop-saturate-200 border border-white/80 dark:border-white/15 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)]"
    const cardSolid = "bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
    const currentCardClass = isGlass ? cardGlass : cardSolid

    const normalizeDateStr = (val) => {
        if (!val) return null
        if (typeof val === 'string') {
            return val.split('T')[0].split(' ')[0]
        }
        if (val instanceof Date) {
            try {
                return val.toISOString().split('T')[0]
            } catch (_) {
                const y = val.getFullYear()
                const m = String(val.getMonth() + 1).padStart(2, '0')
                const d = String(val.getDate()).padStart(2, '0')
                return `${y}-${m}-${d}`
            }
        }
        return String(val)
    }

    const getTaskDate = (task) => {
        if (!task) return null
        return normalizeDateStr(task.dueDate || task.due_date)
    }

    const loadTasks = async () => {
        if (!user) return
        try {
            const data = await taskService.getTasksByUser(user.id)
            setTasks(data)
        } catch (err) { }
    }

    useEffect(() => {
        loadTasks()
    }, [user])

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    const totalDays = lastDay.getDate()

    const days = []
    for (let i = 0; i < startDay; i++) {
        days.push(null)
    }
    for (let i = 1; i <= totalDays; i++) {
        days.push(new Date(year, month, i))
    }

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

    const handleOpenCreate = (dateStr) => {
        setEditingTaskId(null)
        setSelectedDate(dateStr || todayStr)
        setTime('')
        setTitle('')
        setDescription('')
        setStatus('todo')
        setError('')
        setModalOpen(true)
    }

    const handleOpenEdit = (task) => {
        setEditingTaskId(task.id)
        setSelectedDate(getTaskDate(task) || todayStr)
        setTime(task.dueTime || task.due_time || '')
        setTitle(task.name || '')
        setDescription(task.description || '')
        setStatus(task.status || 'todo')
        setError('')
        setModalOpen(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setError('')

        const cleanTitle = title.trim()
        if (!cleanTitle) {
            setError('Veuillez saisir un titre.')
            return
        }

        if (!selectedDate) {
            setError('Veuillez choisir une date.')
            return
        }

        setLoading(true)
        try {
            if (editingTaskId) {
                const current = tasks.find((t) => t.id === editingTaskId)
                const targetStatus = status || current?.status || 'todo'
                const updated = await taskService.updateTask(editingTaskId, {
                    name: cleanTitle,
                    description,
                    dueDate: selectedDate,
                    dueTime: time,
                    status: targetStatus
                })
                setTasks((prev) => prev.map((t) => (t.id === editingTaskId ? { ...t, ...updated, dueDate: selectedDate, status: targetStatus } : t)))
            } else {
                const created = await taskService.createTask({
                    userId: user.id,
                    name: cleanTitle,
                    description,
                    dueDate: selectedDate,
                    dueTime: time,
                    status: status || 'todo'
                })
                setTasks((prev) => [{ ...created, dueDate: selectedDate, status: status || 'todo' }, ...prev])
            }
            setModalOpen(false)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!editingTaskId) return
        setLoading(true)
        try {
            await taskService.deleteTask(editingTaskId)
            setTasks((prev) => prev.filter((t) => t.id !== editingTaskId))
            setModalOpen(false)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 ${isGlass ? 'drop-shadow-sm' : ''} flex items-center gap-3`}>
                        <Calendar className="w-8 h-8 text-amber-500 shrink-0" />
                        Agenda
                    </h1>
                    <p className={`mt-1.5 text-sm sm:text-base font-medium ${isGlass ? 'text-zinc-700 dark:text-zinc-300 drop-shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        Consultez et planifiez vos événements et échéances sur le calendrier.
                    </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className={`flex items-center gap-1 border ${isGlass ? 'border-white/80 dark:border-white/15 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'} rounded-xl p-1 shadow-sm`}>
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-semibold px-2.5 text-zinc-900 dark:text-zinc-100 min-w-28 text-center">
                            {monthNames[month]} {year}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleOpenCreate(todayStr)}
                        className="flex items-center gap-2 h-10 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        Événement
                    </button>
                </div>
            </div>

            <div className={`rounded-2xl overflow-hidden border ${currentCardClass}`}>
                <div className="grid grid-cols-7 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/60">
                    {dayNames.map((d) => (
                        <div key={d} className="py-3 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[125px]">
                    {days.map((day, idx) => {
                        if (!day) {
                            return (
                                <div
                                    key={`empty-${idx}`}
                                    className="border-r border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-900/20"
                                />
                            )
                        }

                        const y = day.getFullYear()
                        const m = String(day.getMonth() + 1).padStart(2, '0')
                        const dt = String(day.getDate()).padStart(2, '0')
                        const dateStr = `${y}-${m}-${dt}`

                        const dayTasks = tasks
                            .filter((t) => getTaskDate(t) === dateStr)
                            .sort((a, b) => (a.dueTime || a.due_time || '').localeCompare(b.dueTime || b.due_time || ''))
                        const isToday = todayStr === dateStr

                        return (
                            <div
                                key={dateStr}
                                onClick={() => handleOpenCreate(dateStr)}
                                className="p-2.5 border-r border-b border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-1 overflow-y-auto hover:bg-zinc-100/40 dark:hover:bg-zinc-800/30 transition cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`text-xs w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${isToday
                                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold shadow-sm'
                                                : 'text-zinc-700 dark:text-zinc-300 font-semibold'
                                            }`}
                                    >
                                        {day.getDate()}
                                    </span>
                                </div>

                                <div className="space-y-1 mt-1">
                                    {dayTasks.map((t) => {
                                        const taskTime = t.dueTime || t.due_time
                                        const isDone = t.status === 'done'
                                        const isInProgress = t.status === 'in_progress'
                                        return (
                                            <div
                                                key={t.id}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleOpenEdit(t)
                                                }}
                                                className={`px-2 py-1 text-[10px] font-semibold rounded-lg truncate border transition cursor-pointer flex items-center gap-1.5 ${
                                                    isDone
                                                        ? 'bg-zinc-100/70 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 line-through'
                                                        : isInProgress
                                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                                                        : 'bg-zinc-100/60 hover:bg-zinc-200/60 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                                                }`}
                                                title={`${t.name}${taskTime ? ' à ' + taskTime : ''}${t.description ? ' - ' + t.description : ''}`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                        isDone
                                                            ? 'bg-emerald-500'
                                                            : isInProgress
                                                            ? 'bg-amber-500'
                                                            : 'bg-blue-500'
                                                    }`}
                                                />
                                                {taskTime && <span className="font-mono text-zinc-500 shrink-0">{taskTime}</span>}
                                                <span className="truncate">{t.name}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className={`w-full max-w-md rounded-2xl p-6 space-y-4 ${
                        isGlass 
                            ? 'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl border border-white/80 dark:border-white/20 shadow-2xl' 
                            : 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl'
                    }`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                                {editingTaskId ? 'Modifier l’événement' : 'Ajouter un événement'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-1 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-3.5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    Titre
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex : Réunion équipe"
                                    required
                                    autoFocus
                                    className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        required
                                        className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                        Heure (optionnel)
                                    </label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    Statut
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition cursor-pointer"
                                >
                                    <option value="todo">À faire</option>
                                    <option value="in_progress">En cours</option>
                                    <option value="done">Terminée</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    Description
                                </label>
                                <textarea
                                    rows="3"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Détails (optionnel)..."
                                    className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                {editingTaskId ? (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-950/40 cursor-pointer disabled:opacity-50 transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Supprimer
                                    </button>
                                ) : <div />}

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold hover:opacity-90 active:scale-95 transition shadow-sm cursor-pointer disabled:opacity-50"
                                    >
                                        {loading ? 'Enregistrement...' : editingTaskId ? 'Mettre à jour' : 'Ajouter'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}