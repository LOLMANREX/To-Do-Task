import { useState, useEffect, useRef, useCallback } from 'react'
import {
    FileText, Plus, Trash2, Save, Pin, Copy, Download, Search,
    Columns2, Eye, Edit3, Check, Loader2, Printer, ChevronLeft,
    Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
    List, ListOrdered, CheckSquare, Quote, Code, Minus, Calendar, ExternalLink,
    PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useViewMode } from '@/contexts/ViewModeContext'
import { noteService } from '@/services/noteService'
import MarkdownPreview from '@/components/MarkdownPreview'


export default function Editor() {
    const { user } = useAuth()
    const { isGlass } = useTheme()
    const { isMobile } = useViewMode()

    const [notes, setNotes] = useState([])
    const [activeNoteId, setActiveNoteId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Draft local states
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [isPinned, setIsPinned] = useState(false)

    // Save states: 'saved' | 'saving' | 'unsaved' | 'error'
    const [saveStatus, setSaveStatus] = useState('saved')
    const [lastSavedTime, setLastSavedTime] = useState(null)
    const [copyNotice, setCopyNotice] = useState(false)

    // View modes: 'split' | 'edit' | 'preview'
    const [editorViewMode, setEditorViewMode] = useState('edit')
    const [showDocSidebar, setShowDocSidebar] = useState(true)
    const [showMobileList, setShowMobileList] = useState(true)

    const textareaRef = useRef(null)
    const saveTimerRef = useRef(null)
    const activeNoteIdRef = useRef(activeNoteId)
    const titleRef = useRef(title)
    const contentRef = useRef(content)
    const isPinnedRef = useRef(isPinned)

    activeNoteIdRef.current = activeNoteId
    titleRef.current = title
    contentRef.current = content
    isPinnedRef.current = isPinned

    // Glass style classes
    const containerGlass = "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-3xl backdrop-saturate-200 border border-white/80 dark:border-white/15 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)]"
    const containerSolid = "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
    const currentContainerClass = isGlass ? containerGlass : containerSolid

    const paneGlass = "bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border-white/60 dark:border-white/10"
    const paneSolid = "bg-zinc-50/70 dark:bg-zinc-950/70 border-zinc-200 dark:border-zinc-800"
    const currentPaneClass = isGlass ? paneGlass : paneSolid

    // 1. Initial Load of Notes
    useEffect(() => {
        let isMounted = true

        async function loadNotes() {
            if (!user) return
            try {
                setLoading(true)
                const fetchedNotes = await noteService.getNotes()
                if (!isMounted) return

                if (fetchedNotes && fetchedNotes.length > 0) {
                    setNotes(fetchedNotes)
                    // Select first or pinned note
                    const initial = fetchedNotes[0]
                    selectNote(initial, user.id)
                } else {
                    setNotes([])
                    setActiveNoteId(null)
                    setTitle('')
                    setContent('')
                    setIsPinned(false)
                }
            } catch (err) {
                console.error('Error loading notes:', err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        loadNotes()

        return () => {
            isMounted = false
        }
    }, [user])

    const selectNote = (note, userId) => {
        // Check local backup draft in case of unsaved crash
        const localBackup = noteService.getLocalBackup(userId || user?.id, note.id)
        let noteTitle = note.title
        let noteContent = note.content || ''
        let notePinned = Boolean(note.pinned)

        if (localBackup && localBackup.savedAt && (!note.updatedAt || localBackup.savedAt > new Date(note.updatedAt).getTime())) {
            if (localBackup.content !== undefined) noteContent = localBackup.content
            if (localBackup.title !== undefined) noteTitle = localBackup.title
            if (localBackup.pinned !== undefined) notePinned = Boolean(localBackup.pinned)
        }

        setActiveNoteId(note.id)
        setTitle(noteTitle)
        setContent(noteContent)
        setIsPinned(notePinned)
        setSaveStatus('saved')
        setLastSavedTime(note.updatedAt ? new Date(note.updatedAt) : new Date())
        if (isMobile) {
            setShowMobileList(false)
        }
    }

    // 2. Perform Save
    const performSave = useCallback(async () => {
        const id = activeNoteIdRef.current
        const currentTitle = titleRef.current
        const currentContent = contentRef.current
        const currentPinned = isPinnedRef.current
        const userId = user?.id

        if (!id || !userId) return

        try {
            setSaveStatus('saving')
            const updated = await noteService.updateNote(id, {
                title: currentTitle,
                content: currentContent,
                pinned: currentPinned
            })

            // Update local backup
            noteService.saveLocalBackup(userId, id, {
                title: currentTitle,
                content: currentContent,
                pinned: currentPinned
            })

            // Update in notes list
            setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updated } : n))
            setSaveStatus('saved')
            setLastSavedTime(new Date())
        } catch (err) {
            console.error('Save failed:', err)
            setSaveStatus('error')
        }
    }, [user])

    // 3. Debounced Auto-Save
    const triggerAutoSave = useCallback(() => {
        if (!activeNoteIdRef.current) return
        setSaveStatus('unsaved')
        if (user && activeNoteIdRef.current) {
            // Write immediately to localStorage for instant crash safety
            noteService.saveLocalBackup(user.id, activeNoteIdRef.current, {
                title: titleRef.current,
                content: contentRef.current,
                pinned: isPinnedRef.current
            })
        }

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current)
        }

        saveTimerRef.current = setTimeout(() => {
            performSave()
        }, 1000)
    }, [user, performSave])

    // Save on beforeunload / unmount
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (activeNoteIdRef.current && user) {
                noteService.saveLocalBackup(user.id, activeNoteIdRef.current, {
                    title: titleRef.current,
                    content: contentRef.current,
                    pinned: isPinnedRef.current
                })
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        }
    }, [user])

    // Keyboard shortcut: Ctrl+S / Cmd+S
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
                performSave()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [performSave])

    // Handlers for Input Changes
    const handleTitleChange = (e) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, title: newTitle } : n))
        triggerAutoSave()
    }

    const handleContentChange = (newVal) => {
        setContent(newVal)
        triggerAutoSave()
    }

    const handleTogglePinned = async () => {
        const nextPinned = !isPinned
        setIsPinned(nextPinned)
        isPinnedRef.current = nextPinned
        setNotes(prev => {
            const updated = prev.map(n => n.id === activeNoteId ? { ...n, pinned: nextPinned } : n)
            return updated.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
        })
        triggerAutoSave()
    }

    // Interactive Checklist Toggle in Markdown Preview
    const handleToggleTaskLine = (lineIndex) => {
        const lines = content.split('\n')
        if (lineIndex < 0 || lineIndex >= lines.length) return
        const line = lines[lineIndex]
        const taskMatch = line.match(/^(\s*[-*]\s*\[)([ xX])(\]\s*.*)$/)
        if (!taskMatch) return

        const currentMark = taskMatch[2]
        const nextMark = currentMark.toLowerCase() === 'x' ? ' ' : 'x'
        lines[lineIndex] = `${taskMatch[1]}${nextMark}${taskMatch[3]}`
        const updated = lines.join('\n')
        setContent(updated)
        triggerAutoSave()
    }

    // Formatting Toolbar Helpers
    const insertFormatting = (prefix, suffix = '', defaultText = '') => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value
        const selected = text.slice(start, end)

        let insert = ''
        let newCursorPos = 0

        if (selected) {
            insert = `${prefix}${selected}${suffix}`
            newCursorPos = start + insert.length
        } else {
            insert = `${prefix}${defaultText}${suffix}`
            newCursorPos = start + prefix.length + (defaultText ? defaultText.length : 0)
        }

        const newContent = text.slice(0, start) + insert + text.slice(end)
        setContent(newContent)
        triggerAutoSave()

        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 10)
    }

    const insertLinePrefix = (prefix) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const text = textarea.value

        // Find the start of current line
        const lineStart = text.lastIndexOf('\n', start - 1) + 1
        const newContent = text.slice(0, lineStart) + prefix + text.slice(lineStart)
        setContent(newContent)
        triggerAutoSave()

        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + prefix.length, start + prefix.length)
        }, 10)
    }

    const insertDateTime = () => {
        const now = new Date()
        const formatted = now.toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
        insertFormatting(`📅 ${formatted} `)
    }

    // Document Management Actions
    const handleCreateNote = async () => {
        try {
            setSaveStatus('saving')
            const newDoc = await noteService.createNote({
                title: 'Nouveau document',
                content: ''
            })
            setNotes(prev => [newDoc, ...prev])
            selectNote(newDoc, user.id)
            if (isMobile) setShowMobileList(false)
        } catch (err) {
            console.error('Failed to create note:', err)
        }
    }

    const handleDeleteNote = async (id, e) => {
        if (e) e.stopPropagation()
        if (!window.confirm('Voulez-vous vraiment supprimer ce document ?')) return

        try {
            await noteService.deleteNote(id)
            noteService.removeLocalBackup(user?.id, id)
            const remaining = notes.filter(n => n.id !== id)
            setNotes(remaining)
            if (activeNoteId === id) {
                if (remaining.length > 0) {
                    selectNote(remaining[0], user?.id)
                } else {
                    setActiveNoteId(null)
                    setTitle('')
                    setContent('')
                    setIsPinned(false)
                    setSaveStatus('saved')
                    if (isMobile) {
                        setShowMobileList(true)
                    }
                }
            }
        } catch (err) {
            console.error('Failed to delete note:', err)
        }
    }

    const handleCopyAll = () => {
        navigator.clipboard.writeText(content)
        setCopyNotice(true)
        setTimeout(() => setCopyNotice(false), 2000)
    }

    const handleDownloadTxt = () => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${(title || 'document').replace(/[^a-z0-9_-]/gi, '_')}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleDownloadMd = () => {
        const blob = new Blob([`# ${title}\n\n${content}`], { type: 'text/markdown;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${(title || 'document').replace(/[^a-z0-9_-]/gi, '_')}.md`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handlePrint = () => {
        window.print()
    }

    // Metrics calculations
    const wordsCount = content.trim() ? content.trim().split(/\s+/).length : 0
    const charsCount = content.length
    const readingTime = Math.max(1, Math.ceil(wordsCount / 200))

    // Filtered Notes
    const filteredNotes = notes.filter(n => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (n.title && n.title.toLowerCase().includes(q)) || (n.content && n.content.toLowerCase().includes(q))
    })

    const activeNote = notes.find(n => n.id === activeNoteId)

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                <p className="text-sm font-medium">Chargement de vos documents...</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-300 h-full flex flex-col pb-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
                        <FileText className="w-7 h-7 text-sky-500" />
                        Éditeur de documents
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Rédigez, organisez et conservez vos documents avec sauvegarde persistante multi-supports.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={handleCreateNote}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sky-500 hover:bg-sky-600 active:scale-95 text-white shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        Nouveau document
                    </button>
                </div>
            </div>

            {/* Main Application Area */}
            <div className={`flex-1 rounded-2xl overflow-hidden border ${currentContainerClass} flex flex-col lg:flex-row min-h-[680px]`}>
                {/* Left Sidebar: Document List */}
                <div className={`w-full lg:w-56 xl:w-60 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col shrink-0 transition-all ${
                    !showDocSidebar ? 'hidden' : isMobile && !showMobileList ? 'hidden' : 'flex'
                }`}>
                    {/* Search & Count */}
                    <div className="p-2.5 border-b border-zinc-200 dark:border-zinc-800/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 px-1">
                            <span>DOCS ({filteredNotes.length})</span>
                            {notes.filter(n => n.pinned).length > 0 && (
                                <span className="text-[10px] text-amber-500 font-medium">{notes.filter(n => n.pinned).length} épinglé</span>
                            )}
                        </div>
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 focus:outline-none focus:ring-1 focus:ring-sky-500 text-zinc-900 dark:text-zinc-100"
                            />
                        </div>
                    </div>

                    {/* Notes Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 max-h-[320px] lg:max-h-[calc(100vh-280px)]">
                        {filteredNotes.length === 0 ? (
                            <div className="p-6 text-center text-xs text-zinc-400 dark:text-zinc-500 italic">
                                Aucun document trouvé.
                            </div>
                        ) : (
                            filteredNotes.map((note) => {
                                const isActive = note.id === activeNoteId
                                const snippet = (note.content || '').replace(/^[#\s\->*]+/, '').slice(0, 60) || 'Document vide...'
                                const dateFormatted = note.updatedAt ? new Date(note.updatedAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'short'
                                }) : ''

                                return (
                                    <div
                                        key={note.id}
                                        onClick={() => selectNote(note, user?.id)}
                                        className={`group relative p-2 rounded-xl cursor-pointer transition-all ${
                                            isActive
                                                ? isGlass
                                                    ? 'bg-sky-500/15 border border-sky-400/40 shadow-sm text-sky-900 dark:text-sky-100'
                                                    : 'bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                                                : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 border border-transparent text-zinc-700 dark:text-zinc-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-1.5">
                                            <div className="flex items-center gap-1.5 font-medium text-xs sm:text-sm truncate flex-1 min-w-0">
                                                {note.pinned && (
                                                    <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                                                )}
                                                <span className="truncate">{note.title || 'Document sans titre'}</span>
                                            </div>
                                            <button
                                                type="button"
                                                title="Supprimer"
                                                onClick={(e) => handleDeleteNote(note.id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer shrink-0"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5 leading-snug font-normal">
                                            {snippet}
                                        </p>

                                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-zinc-200/40 dark:border-zinc-800/40 text-[9px] text-zinc-400">
                                            <span>{dateFormatted || 'Récemment'}</span>
                                            <span>{(note.content || '').length} car.</span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Right Area: Document Editor & Toolbar & Preview */}
                <div className={`flex-1 flex flex-col min-w-0 ${
                    isMobile && showMobileList ? 'hidden lg:flex' : 'flex'
                }`}>
                    {!activeNote ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 dark:text-zinc-400 relative">
                            {!isMobile && !showDocSidebar && (
                                <button
                                    type="button"
                                    onClick={() => setShowDocSidebar(true)}
                                    title="Afficher la liste des documents"
                                    className="absolute top-4 left-4 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
                                >
                                    <PanelLeftOpen className="w-4 h-4 text-sky-500" />
                                    <span>Afficher les documents</span>
                                </button>
                            )}
                            {isMobile && (
                                <button
                                    type="button"
                                    onClick={() => setShowMobileList(true)}
                                    className="self-start mb-6 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 text-xs"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Retour à la liste
                                </button>
                            )}
                            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                                Aucun document sélectionné
                            </h3>
                            <p className="text-sm max-w-sm text-zinc-500 dark:text-zinc-400 mb-5">
                                Vous n'avez aucun document ouvert. Créez un nouveau document pour commencer à rédiger.
                            </p>
                            <button
                                type="button"
                                onClick={handleCreateNote}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-600 active:scale-95 text-white shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4 stroke-[2.5]" />
                                Nouveau document
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Top Action & Meta Bar */}
                    <div className="p-3 sm:px-5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            {/* Toggle Doc Sidebar Button (desktop) */}
                            {!isMobile && (
                                <button
                                    type="button"
                                    onClick={() => setShowDocSidebar(!showDocSidebar)}
                                    title={showDocSidebar ? "Masquer la liste des documents" : "Afficher la liste des documents"}
                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                                >
                                    {showDocSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4 text-sky-500" />}
                                </button>
                            )}

                            {/* Mobile Back Button */}
                            {isMobile && (
                                <button
                                    type="button"
                                    onClick={() => setShowMobileList(true)}
                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            )}

                            {/* Editable Title Input */}
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="Titre du document..."
                                className="w-full text-base sm:text-lg font-bold bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-sky-500/50 rounded px-1.5 py-0.5 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400"
                            />
                        </div>

                        {/* Status Badge & Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Save Status Indicator */}
                            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/60 font-medium">
                                {saveStatus === 'saving' && (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
                                        <span className="text-sky-600 dark:text-sky-400 hidden sm:inline">Enregistrement...</span>
                                    </>
                                )}
                                {saveStatus === 'saved' && (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                                            {lastSavedTime ? `Enregistré à ${lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Enregistré'}
                                        </span>
                                    </>
                                )}
                                {saveStatus === 'unsaved' && (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-amber-600 dark:text-amber-400 hidden sm:inline">Non enregistré</span>
                                    </>
                                )}
                                {saveStatus === 'error' && (
                                    <span className="text-rose-500">Erreur de sauvegarde</span>
                                )}
                            </div>

                            {/* Pin Toggle */}
                            <button
                                type="button"
                                onClick={handleTogglePinned}
                                title={isPinned ? 'Désépingler' : 'Épingler en haut'}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    isPinned
                                        ? 'bg-amber-500/15 border-amber-400/50 text-amber-500'
                                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                                }`}
                            >
                                <Pin className={`w-4 h-4 ${isPinned ? 'fill-amber-500' : ''}`} />
                            </button>

                            {/* Manual Save Button */}
                            <button
                                type="button"
                                onClick={performSave}
                                title="Sauvegarder immédiatement (Ctrl+S)"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer shadow-sm active:scale-95"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Sauvegarder</span>
                            </button>

                            {/* View Mode Switcher */}
                            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100/70 dark:bg-zinc-800/50">
                                <button
                                    type="button"
                                    onClick={() => setEditorViewMode('edit')}
                                    title="Mode Édition"
                                    className={`p-1.5 rounded-md text-xs cursor-pointer transition-all ${
                                        editorViewMode === 'edit'
                                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {!isMobile && (
                                    <button
                                        type="button"
                                        onClick={() => setEditorViewMode('split')}
                                        title="Vue Côte à côte (Split)"
                                        className={`p-1.5 rounded-md text-xs cursor-pointer transition-all ${
                                            editorViewMode === 'split'
                                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                                        }`}
                                    >
                                        <Columns2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setEditorViewMode('preview')}
                                    title="Mode Aperçu"
                                    className={`p-1.5 rounded-md text-xs cursor-pointer transition-all ${
                                        editorViewMode === 'preview'
                                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Export / Actions dropdown / buttons */}
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={handleCopyAll}
                                    title="Copier tout le contenu"
                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                                >
                                    {copyNotice ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDownloadMd}
                                    title="Télécharger en Markdown (.md)"
                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    title="Imprimer / Exporter en PDF"
                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                                >
                                    <Printer className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Rich Formatting Toolbar */}
                    {editorViewMode !== 'preview' && (
                        <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-wrap items-center gap-1 text-zinc-600 dark:text-zinc-300">
                            {/* Headings */}
                            <div className="flex items-center gap-0.5 border-r border-zinc-300 dark:border-zinc-700 pr-1.5 mr-1">
                                <button
                                    type="button"
                                    onClick={() => insertLinePrefix('# ')}
                                    title="Titre 1 (H1)"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <Heading1 className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertLinePrefix('## ')}
                                    title="Titre 2 (H2)"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <Heading2 className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertLinePrefix('### ')}
                                    title="Titre 3 (H3)"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <Heading3 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Styles */}
                            <div className="flex items-center gap-0.5 border-r border-zinc-300 dark:border-zinc-700 pr-1.5 mr-1">
                                <button
                                    type="button"
                                    onClick={() => insertFormatting('**', '**', 'texte en gras')}
                                    title="Gras (**texte**)"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <Bold className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertFormatting('*', '*', 'texte en italique')}
                                    title="Italique (*texte*)"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <Italic className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertFormatting('<u>', '</u>', 'texte souligné')}
                                    title="Souligné (<u>texte</u>)"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <Underline className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertFormatting('~~', '~~', 'texte barré')}
                                    title="Barré (~~texte~~)"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <Strikethrough className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Lists & Tasks */}
                            <div className="flex items-center gap-0.5 border-r border-zinc-300 dark:border-zinc-700 pr-1.5 mr-1">
                                <button
                                    type="button"
                                    onClick={() => insertLinePrefix('- ')}
                                    title="Liste à puces"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertLinePrefix('1. ')}
                                    title="Liste numérotée"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <ListOrdered className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertLinePrefix('- [ ] ')}
                                    title="Liste de tâches / Checklist"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-sky-600 dark:text-sky-400"
                                >
                                    <CheckSquare className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Extras: Quote, Code, Divider, Date */}
                            <div className="flex items-center gap-0.5">
                                <button
                                    type="button"
                                    onClick={() => insertLinePrefix('> ')}
                                    title="Citation (> texte)"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <Quote className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertFormatting('`', '`', 'code')}
                                    title="Code en ligne (`code`)"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer font-mono text-xs"
                                >
                                    <Code className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertFormatting('\n```javascript\n// Votre code\n', '\n```\n')}
                                    title="Bloc de code (```)"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer font-mono text-xs font-bold"
                                >
                                    {'{ }'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertFormatting('\n---\n')}
                                    title="Ligne séparatrice"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={insertDateTime}
                                    title="Insérer Date et Heure"
                                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-amber-500"
                                >
                                    <Calendar className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Editor & Preview Area */}
                    <div className="flex-1 flex overflow-hidden min-h-[460px]">
                        {/* Editor Input */}
                        {(editorViewMode === 'edit' || (editorViewMode === 'split' && !isMobile)) && (
                            <div className={`flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden ${
                                editorViewMode === 'split' ? 'border-r border-zinc-200 dark:border-zinc-800' : ''
                            }`}>
                                <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
                                    <textarea
                                        ref={textareaRef}
                                        value={content}
                                        onChange={(e) => handleContentChange(e.target.value)}
                                        placeholder="Commencez à rédiger votre texte ici... Utilisez la barre d'outils ci-dessus ou les raccourcis Markdown (# Titre, - Liste, etc.)"
                                        className="flex-1 w-full bg-transparent resize-none border-0 focus:outline-none text-zinc-900 dark:text-zinc-100 font-sans text-sm sm:text-base leading-relaxed selection:bg-sky-500/30 overflow-y-auto"
                                        spellCheck="false"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Live Rendered Markdown Preview */}
                        {(editorViewMode === 'preview' || (editorViewMode === 'split' && !isMobile)) && (
                            <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-zinc-50/30 dark:bg-zinc-950/30">
                                <div className="max-w-4xl mx-auto">
                                    <MarkdownPreview
                                        content={content}
                                        onToggleTask={handleToggleTaskLine}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Status / Word count bar */}
                    <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-900/40 text-[11px] text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-4">
                            <span><strong>{wordsCount}</strong> mots</span>
                            <span><strong>{charsCount}</strong> caractères</span>
                            <span>~{readingTime} min de lecture</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="hidden sm:inline">Raccourci : <strong>Ctrl+S</strong> pour sauvegarder</span>
                            <span className="text-zinc-400">Édition continue</span>
                        </div>
                    </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
