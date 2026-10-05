import { createContext, useContext, useState } from 'react'
import { Monitor, Smartphone } from 'lucide-react'

const ViewModeContext = createContext(null)

export function ViewModeProvider({ children }) {
    const [viewMode, setViewModeState] = useState(() => {
        const saved = localStorage.getItem('todo_view_mode')
        return saved === 'mobile' || saved === 'desktop' ? saved : 'desktop'
    })

    const [showModal, setShowModal] = useState(() => {
        return !localStorage.getItem('todo_view_mode')
    })

    const setViewMode = (mode) => {
        setViewModeState(mode)
        localStorage.setItem('todo_view_mode', mode)
    }

    const toggleViewMode = () => {
        const nextMode = viewMode === 'desktop' ? 'mobile' : 'desktop'
        setViewMode(nextMode)
    }

    const handleSelectInitial = (mode) => {
        setViewMode(mode)
        setShowModal(false)
    }

    return (
        <ViewModeContext.Provider
            value={{
                viewMode,
                setViewMode,
                toggleViewMode,
                isMobile: viewMode === 'mobile',
                isDesktop: viewMode === 'desktop'
            }}
        >
            {children}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-2xl text-zinc-900 dark:text-zinc-100 space-y-6">
                        <div className="space-y-1.5">
                            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Choisir l'expérience
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Sélectionnez le mode d'affichage pour la démonstration.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                type="button"
                                onClick={() => handleSelectInitial('desktop')}
                                className="group flex items-start gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-none text-left cursor-pointer"
                            >
                                <div className="p-2.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-none">
                                    <Monitor className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        Ordinateur
                                    </div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        Affichage complet standard avec barre latérale.
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSelectInitial('mobile')}
                                className="group flex items-start gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-none text-left cursor-pointer"
                            >
                                <div className="p-2.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-none">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        Mobile
                                    </div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        Maquette smartphone avec navigation basse.
                                    </div>
                                </div>
                            </button>
                        </div>

                        <div className="pt-2 text-center border-t border-zinc-100 dark:border-zinc-900">
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                                Vous pourrez changer de mode à tout moment pendant la présentation.
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </ViewModeContext.Provider>
    )
}

export function useViewMode() {
    const context = useContext(ViewModeContext)
    if (!context) {
        throw new Error('useViewMode doit être utilisé dans un ViewModeProvider')
    }
    return context
}
