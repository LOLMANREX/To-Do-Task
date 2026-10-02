import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { taskService } from '@/services/taskService'

export default function Settings() {
    const { user } = useAuth()
    const { mode, setMode } = useTheme()
    const [isExporting, setIsExporting] = useState(false)

    const handleExportData = async () => {
        setIsExporting(true)
        try {
            const tasks = await taskService.getTasksByUser(user.id)
            const dataStr = JSON.stringify({ user, tasks }, null, 2)
            const blob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `todo-task-export.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error(err)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Paramètres</h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Préférences de l'application et gestion des données.
                </p>
            </div>

            <div className="space-y-6">
                <section className="space-y-4">
                    <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Apparence</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMode('light')}
                            className={`px-4 py-2 rounded-md text-sm font-medium border transition-none cursor-pointer ${mode === 'light'
                                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                                    : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'
                                }`}
                        >
                            Mode Clair
                        </button>
                        <button
                            onClick={() => setMode('dark')}
                            className={`px-4 py-2 rounded-md text-sm font-medium border transition-none cursor-pointer ${mode === 'dark'
                                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                                    : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'
                                }`}
                        >
                            Mode Sombre
                        </button>
                    </div>
                </section>

                <hr className="border-zinc-200 dark:border-zinc-900" />

                <section className="space-y-4">
                    <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Données locales</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Exportez l'intégralité de vos tâches stockées sur ce navigateur.
                    </p>
                    <button
                        onClick={handleExportData}
                        disabled={isExporting}
                        className="px-4 py-2 rounded-md bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 transition-none cursor-pointer"
                    >
                        {isExporting ? 'Exportation...' : 'Exporter en JSON'}
                    </button>
                </section>
            </div>
        </div>
    )
}