import { useState, useRef, useEffect } from 'react'
import { Monitor, Smartphone, Sun, Moon, Upload, RotateCcw, Check, User as UserIcon, Sparkles, Droplets } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useViewMode } from '@/contexts/ViewModeContext'
import { taskService } from '@/services/taskService'
import { authService } from '@/services/authService'
import { Avatar, DEFAULT_AVATARS } from '@/components/Avatar'

export default function Settings() {
    const { user, updateUser } = useAuth()
    const { mode, setMode } = useTheme()
    const { viewMode, setViewMode } = useViewMode()
    const [isExporting, setIsExporting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: ''
    })

    const fileInputRef = useRef(null)

    useEffect(() => {
        if (user) {
            setProfileForm({
                firstName: user.firstName || '',
                lastName: user.lastName || ''
            })
        }
    }, [user])

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('Le fichier ne doit pas dépasser 5 Mo')
            return
        }

        setIsUploading(true)
        setErrorMessage('')
        setStatusMessage('')

        try {
            const updated = await authService.uploadAvatar(file)
            updateUser(updated)
            setStatusMessage('Photo de profil mise à jour avec succès')
        } catch (err) {
            setErrorMessage(err.message || 'Erreur lors de l’envoi de la photo')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleSelectPreset = async (presetUrl) => {
        setIsUploading(true)
        setErrorMessage('')
        setStatusMessage('')

        try {
            const updated = await authService.setAvatarPreset(presetUrl)
            updateUser(updated)
            setStatusMessage('Avatar appliqué avec succès')
        } catch (err) {
            setErrorMessage(err.message || 'Erreur lors de la sélection')
        } finally {
            setIsUploading(false)
        }
    }

    const handleResetAvatar = async () => {
        setIsUploading(true)
        setErrorMessage('')
        setStatusMessage('')

        try {
            const updated = await authService.deleteAvatar()
            updateUser(updated)
            setStatusMessage('Photo de profil réinitialisée par défaut')
        } catch (err) {
            setErrorMessage(err.message || 'Erreur lors de la réinitialisation')
        } finally {
            setIsUploading(false)
        }
    }

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        setIsSavingProfile(true)
        setErrorMessage('')
        setStatusMessage('')

        try {
            const updated = await authService.updateProfile(profileForm)
            updateUser(updated)
            setStatusMessage('Profil mis à jour avec succès')
        } catch (err) {
            setErrorMessage(err.message || 'Erreur lors de la mise à jour')
        } finally {
            setIsSavingProfile(false)
        }
    }

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
        <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Paramètres</h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Préférences de votre compte, apparence et gestion des données.
                </p>
            </div>

            {statusMessage && (
                <div className="p-3.5 rounded-xl text-sm font-medium bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{statusMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div className="p-3.5 rounded-xl text-sm font-medium bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-300">
                    {errorMessage}
                </div>
            )}

            <div className="space-y-8">
                <section className="space-y-4">
                    <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Photo de profil</h2>
                    
                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <Avatar user={user} size="2xl" className="ring-4 ring-zinc-100 dark:ring-zinc-800" />
                        
                        <div className="flex-1 space-y-3 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email?.split('@')[0]}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 self-center sm:self-auto border border-zinc-200 dark:border-zinc-700">
                                    {user?.avatarUrl ? 'Photo personnalisée' : 'Photo par défaut'}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Formats acceptés : JPG, PNG, WEBP ou GIF. Taille maximale : 5 Mo.
                            </p>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    {isUploading ? 'Chargement...' : 'Changer la photo'}
                                </button>
                                
                                {user?.avatarUrl && (
                                    <button
                                        type="button"
                                        onClick={handleResetAvatar}
                                        disabled={isUploading}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-medium transition-colors cursor-pointer"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Réinitialiser
                                    </button>
                                )}
                            </div>

                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2.5">
                                    Ou choisir un avatar par défaut :
                                </p>
                                <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                                    {DEFAULT_AVATARS.map((preset) => {
                                        const isSelected = user?.avatarUrl === preset.url || (!user?.avatarUrl && preset.id === 'silhouette')
                                        return (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => handleSelectPreset(preset.url)}
                                                className={`relative h-10 w-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 ${isSelected ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-400/40' : 'border-transparent opacity-75 hover:opacity-100'}`}
                                                title={preset.name}
                                            >
                                                <img src={preset.url} alt={preset.name} className="h-full w-full object-cover" />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-zinc-200 dark:border-zinc-900" />

                <section className="space-y-4">
                    <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Informations personnelles</h2>
                    <form onSubmit={handleProfileSubmit} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                                    Prénom (Pseudo)
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.firstName}
                                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                    placeholder="Ex: Alexandre"
                                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.lastName}
                                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                    placeholder="Ex: Dupont"
                                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSavingProfile}
                                className="px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                            >
                                {isSavingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </form>
                </section>

                <hr className="border-zinc-200 dark:border-zinc-900" />

                <section className="space-y-4">
                    <div>
                        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Thèmes & Ambiances</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Sélectionnez l'univers visuel et le niveau de réfraction de l'interface.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setMode('light')}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${mode === 'light' ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/20 bg-white dark:bg-zinc-900 shadow-md' : 'border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                                    <Sun className="w-4 h-4" />
                                </div>
                                {mode === 'light' && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                                        <Check className="w-3 h-3" /> Actif
                                    </span>
                                )}
                            </div>
                            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Minimaliste Clair</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Style SaaS brutal-minimaliste épuré avec contrastes nets et fond immaculé.
                            </p>
                            <div className="mt-3 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-300">
                                <span>Contraste élevé</span>
                                <span className="font-mono">#FFFFFF</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMode('dark')}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${mode === 'dark' ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/20 bg-white dark:bg-zinc-900 shadow-md' : 'border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Moon className="w-4 h-4" />
                                </div>
                                {mode === 'dark' && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                                        <Check className="w-3 h-3" /> Actif
                                    </span>
                                )}
                            </div>
                            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Minimaliste Sombre</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Noir profond et élégance nocturne réduisant la fatigue visuelle.
                            </p>
                            <div className="mt-3 p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                                <span>Nocturne pur</span>
                                <span className="font-mono">#09090B</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMode('glass-light')}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                                mode === 'glass-light'
                                    ? 'border-white/80 ring-2 ring-sky-400/40 bg-white/75 shadow-[0_16px_36px_-10px_rgba(14,165,233,0.25)]'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:border-sky-300 dark:hover:border-sky-800'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-400/30 to-pink-400/30 border border-white/80 flex items-center justify-center text-sky-600 shadow-sm backdrop-blur-md">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100/80 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-300/60 dark:border-sky-800 backdrop-blur-sm">
                                        Apple visionOS
                                    </span>
                                    {mode === 'glass-light' && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-600 text-white shadow-sm">
                                            <Check className="w-3 h-3" /> Actif
                                        </span>
                                    )}
                                </div>
                            </div>
                            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">Apple Liquid Glass Clair</h3>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                                Verre optique Apple, réfraction chromatique macOS Sonoma et biseau spéculaire 1px.
                            </p>
                            <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-sky-200/50 via-pink-200/40 to-amber-200/50 border border-white/80 backdrop-blur-xl flex items-center justify-between text-[11px] text-slate-800 font-medium shadow-sm">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                                    Réfraction boréale
                                </span>
                                <span className="font-mono text-[10px] bg-white/70 px-1.5 py-0.5 rounded border border-white/80 text-sky-900">SF Pro • Sonoma</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMode('glass-dark')}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                                mode === 'glass-dark'
                                    ? 'border-indigo-400/60 ring-2 ring-indigo-500/40 bg-zinc-900/90 shadow-[0_20px_45px_-12px_rgba(99,102,241,0.35)]'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:border-indigo-400/50'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center text-indigo-300 shadow-sm backdrop-blur-md">
                                    <Droplets className="w-4 h-4" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 backdrop-blur-sm">
                                        Space Obsidian
                                    </span>
                                    {mode === 'glass-dark' && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-sm">
                                            <Check className="w-3 h-3" /> Actif
                                        </span>
                                    )}
                                </div>
                            </div>
                            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">Apple Liquid Glass Sombre</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Obsidienne visionOS cosmique, plasma bioluminescent profond et reflets d'arête ciselés.
                            </p>
                            <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/90 via-purple-950/80 to-teal-950/80 border border-white/15 backdrop-blur-xl flex items-center justify-between text-[11px] text-indigo-200 font-medium shadow-sm">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                                    Plasma stellaire
                                </span>
                                <span className="font-mono text-[10px] bg-black/50 px-1.5 py-0.5 rounded border border-white/10 text-indigo-300">SF Pro • Deep Space</span>
                            </div>
                        </button>
                    </div>
                </section>

                <hr className="border-zinc-200 dark:border-zinc-900" />

                <section className="space-y-4">
                    <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Mode d'affichage</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Format d'affichage pour la présentation et la démonstration.
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setViewMode('desktop')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-all cursor-pointer ${viewMode === 'desktop'
                                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                                    : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                        >
                            <Monitor className="w-4 h-4" />
                            Ordinateur
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('mobile')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-all cursor-pointer ${viewMode === 'mobile'
                                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                                    : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                        >
                            <Smartphone className="w-4 h-4" />
                            Mobile
                        </button>
                    </div>
                </section>

                <hr className="border-zinc-200 dark:border-zinc-900" />

                <section className="space-y-4">
                    <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Données locales</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Exportez l'intégralité de vos tâches stockées sur ce compte.
                    </p>
                    <button
                        type="button"
                        onClick={handleExportData}
                        disabled={isExporting}
                        className="px-4 py-2 rounded-md bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        {isExporting ? 'Exportation...' : 'Exporter en JSON'}
                    </button>
                </section>
            </div>
        </div>
    )
}