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

function generatePrintHtml(title, markdownContent) {
    const cleanTitle = (title || 'Document sans titre').trim()
    const content = markdownContent || ''
    const lines = content.split('\n')
    
    let html = ''
    let inCodeBlock = false
    let codeBuffer = []
    let codeLang = ''
    let inList = false
    let listType = null
    let tableBuffer = []

    const flushList = () => {
        if (inList) {
            html += listType === 'ul' ? '</ul>\n' : '</ol>\n'
            inList = false
            listType = null
        }
    }

    const parseInlinePrint = (text) => {
        if (!text) return ''
        let res = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
        
        res = res.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<u>$1</u>')
        res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        res = res.replace(/\*(.*?)\*/g, '<em>$1</em>')
        res = res.replace(/~~(.*?)~~/g, '<del>$1</del>')
        res = res.replace(/`([^`]+)`/g, '<code>$1</code>')
        res = res.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 4pt; margin: 8pt 0;" />')
        res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        return res
    }

    const flushTable = () => {
        if (tableBuffer.length === 0) return
        const headerRow = tableBuffer[0]
        const dataRows = tableBuffer.slice(2)
        html += '<div class="table-container"><table><thead><tr>'
        for (const cell of headerRow) {
            html += `<th>${parseInlinePrint(cell)}</th>`
        }
        html += '</tr></thead><tbody>'
        for (const row of dataRows) {
            html += '<tr>'
            for (const cell of row) {
                html += `<td>${parseInlinePrint(cell)}</td>`
            }
            html += '</tr>'
        }
        html += '</tbody></table></div>\n'
        tableBuffer = []
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        if (line.trim().startsWith('```')) {
            flushList()
            flushTable()
            if (inCodeBlock) {
                const escaped = codeBuffer.join('\n').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                html += `<pre><code class="lang-${codeLang}">${escaped}</code></pre>\n`
                codeBuffer = []
                codeLang = ''
                inCodeBlock = false
            } else {
                inCodeBlock = true
                codeLang = line.trim().slice(3).trim()
            }
            continue
        }

        if (inCodeBlock) {
            codeBuffer.push(line)
            continue
        }

        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            flushList()
            const cells = line.split('|').slice(1, -1).map(c => c.trim())
            tableBuffer.push(cells)
            continue
        } else {
            flushTable()
        }

        if (/^(\*\*\*|---|___)$/.test(line.trim())) {
            flushList()
            html += '<hr />\n'
            continue
        }

        if (line.startsWith('# ')) {
            flushList()
            html += `<h1>${parseInlinePrint(line.slice(2))}</h1>\n`
            continue
        }
        if (line.startsWith('## ')) {
            flushList()
            html += `<h2>${parseInlinePrint(line.slice(3))}</h2>\n`
            continue
        }
        if (line.startsWith('### ')) {
            flushList()
            html += `<h3>${parseInlinePrint(line.slice(4))}</h3>\n`
            continue
        }
        if (line.startsWith('#### ')) {
            flushList()
            html += `<h4>${parseInlinePrint(line.slice(5))}</h4>\n`
            continue
        }

        if (line.startsWith('> ')) {
            flushList()
            html += `<blockquote>${parseInlinePrint(line.slice(2))}</blockquote>\n`
            continue
        }

        const taskMatch = line.match(/^(\s*)[-*]\s*\[([ xX])\]\s*(.*)$/)
        if (taskMatch) {
            flushList()
            const isChecked = taskMatch[2].toLowerCase() === 'x'
            const itemText = taskMatch[3]
            html += `<div class="task-item ${isChecked ? 'task-done' : ''}">`
            html += `<span class="checkbox ${isChecked ? 'checked' : ''}">${isChecked ? '✓' : ''}</span>`
            html += `<span>${parseInlinePrint(itemText)}</span></div>\n`
            continue
        }

        const bulletMatch = line.match(/^(\s*)[-*+]\s+(.*)$/)
        if (bulletMatch) {
            if (!inList || listType !== 'ul') {
                flushList()
                inList = true
                listType = 'ul'
                html += '<ul>\n'
            }
            html += `<li>${parseInlinePrint(bulletMatch[2])}</li>\n`
            continue
        }

        const numMatch = line.match(/^(\s*)\d+\.\s+(.*)$/)
        if (numMatch) {
            if (!inList || listType !== 'ol') {
                flushList()
                inList = true
                listType = 'ol'
                html += '<ol>\n'
            }
            html += `<li>${parseInlinePrint(numMatch[2])}</li>\n`
            continue
        }

        if (!line.trim()) {
            flushList()
            continue
        }

        flushList()
        html += `<p>${parseInlinePrint(line)}</p>\n`
    }

    flushList()
    flushTable()

    const firstLineWithContent = lines.find(l => l.trim().length > 0) || ''
    const heading1Match = firstLineWithContent.match(/^#\s+(.*)$/)
    const hasMatchingH1 = heading1Match && heading1Match[1].trim().toLowerCase() === cleanTitle.toLowerCase()

    const headerHtml = hasMatchingH1 ? '' : `<div class="document-header"><h1 class="document-title">${cleanTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1></div>`

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>${cleanTitle.replace(/"/g, '&quot;')}</title>
    <style>
        @page {
            size: A4;
            margin: 20mm 16mm 20mm 16mm;
        }
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #111827;
            background: #ffffff;
            margin: 0;
            padding: 0;
        }
        .document-header {
            margin-bottom: 20pt;
            padding-bottom: 10pt;
            border-bottom: 2pt solid #e5e7eb;
        }
        .document-title {
            font-size: 22pt;
            font-weight: 800;
            color: #111827;
            margin: 0;
            line-height: 1.25;
        }
        h1, h2, h3, h4 {
            color: #111827;
            page-break-after: avoid;
            break-after: avoid;
        }
        h1 {
            font-size: 18pt;
            font-weight: 700;
            margin: 18pt 0 8pt 0;
            padding-bottom: 4pt;
            border-bottom: 1pt solid #e5e7eb;
        }
        h2 {
            font-size: 14pt;
            font-weight: 600;
            margin: 14pt 0 6pt 0;
            padding-bottom: 3pt;
            border-bottom: 1pt solid #f3f4f6;
        }
        h3 {
            font-size: 12pt;
            font-weight: 600;
            margin: 12pt 0 4pt 0;
        }
        h4 {
            font-size: 11pt;
            font-weight: 600;
            margin: 10pt 0 4pt 0;
        }
        p {
            margin: 6pt 0;
            text-align: justify;
        }
        strong {
            font-weight: 700;
            color: #000;
        }
        em {
            font-style: italic;
        }
        del {
            text-decoration: line-through;
            color: #9ca3af;
        }
        u {
            text-decoration: underline;
        }
        a {
            color: #0284c7;
            text-decoration: underline;
        }
        blockquote {
            margin: 10pt 0;
            padding: 6pt 12pt;
            border-left: 3pt solid #0284c7;
            background: #f8fafc;
            color: #475569;
            font-style: italic;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        ul, ol {
            margin: 6pt 0;
            padding-left: 20pt;
        }
        li {
            margin: 3pt 0;
        }
        .task-item {
            display: flex;
            align-items: center;
            margin: 4pt 0;
            font-size: 10.5pt;
        }
        .checkbox {
            display: inline-block;
            width: 12pt;
            height: 12pt;
            border: 1.5pt solid #6b7280;
            border-radius: 2pt;
            margin-right: 6pt;
            text-align: center;
            line-height: 11pt;
            font-size: 9pt;
            font-weight: bold;
            flex-shrink: 0;
        }
        .checkbox.checked {
            background-color: #0284c7;
            border-color: #0284c7;
            color: #ffffff;
        }
        .task-done {
            text-decoration: line-through;
            color: #9ca3af;
        }
        pre {
            background: #f8fafc;
            border: 1pt solid #e2e8f0;
            border-radius: 4pt;
            padding: 8pt 10pt;
            font-family: Consolas, Monaco, "Courier New", monospace;
            font-size: 9pt;
            line-height: 1.45;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            page-break-inside: avoid;
            break-inside: avoid;
            margin: 8pt 0;
        }
        code {
            font-family: Consolas, Monaco, "Courier New", monospace;
            font-size: 9.5pt;
            background: #f1f5f9;
            padding: 1pt 3pt;
            border-radius: 2pt;
            border: 0.5pt solid #e2e8f0;
        }
        pre code {
            background: none;
            padding: 0;
            border: none;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 12pt 0;
            page-break-inside: avoid;
            break-inside: avoid;
            font-size: 10pt;
        }
        th, td {
            border: 1pt solid #cbd5e1;
            padding: 6pt 8pt;
            text-align: left;
        }
        th {
            background-color: #f1f5f9;
            font-weight: 700;
            color: #0f172a;
        }
        hr {
            border: 0;
            border-top: 1pt solid #e2e8f0;
            margin: 14pt 0;
        }
    </style>
</head>
<body>
    ${headerHtml}
    <div class="document-body">
        ${html || '<p style="color: #9ca3af; font-style: italic;">(Document vide)</p>'}
    </div>
</body>
</html>`
}

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

    const handlePrint = useCallback(() => {
        const docTitle = (titleRef.current || 'Document sans titre').trim()
        const docContent = contentRef.current || ''

        const printHtml = generatePrintHtml(docTitle, docContent)

        // Remove old iframe if any
        const oldFrame = document.getElementById('todo-print-frame')
        if (oldFrame) {
            oldFrame.remove()
        }

        const iframe = document.createElement('iframe')
        iframe.id = 'todo-print-frame'
        iframe.style.position = 'fixed'
        iframe.style.right = '0'
        iframe.style.bottom = '0'
        iframe.style.width = '0'
        iframe.style.height = '0'
        iframe.style.border = '0'
        iframe.style.zIndex = '-9999'
        iframe.style.opacity = '0'
        document.body.appendChild(iframe)

        const pri = iframe.contentWindow
        pri.document.open()
        pri.document.write(printHtml)
        pri.document.close()

        pri.focus()
        setTimeout(() => {
            try {
                pri.print()
            } catch (err) {
                console.error('Erreur impression:', err)
            }
        }, 250)
    }, [])

    // Keyboard shortcuts: Ctrl+S (Save), Ctrl+P (Print)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
                performSave()
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault()
                handlePrint()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [performSave, handlePrint])

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
        <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col pb-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 ${isGlass ? 'drop-shadow-sm' : ''} flex items-center gap-3`}>
                        <FileText className="w-8 h-8 text-sky-500 shrink-0" />
                        Éditeur de documents
                    </h1>
                    <p className={`mt-1.5 text-sm sm:text-base font-medium ${isGlass ? 'text-zinc-700 dark:text-zinc-300 drop-shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        Rédigez, organisez et conservez vos documents avec sauvegarde automatique.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={handleCreateNote}
                        className="flex items-center gap-2 h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-sky-500 hover:bg-sky-600 active:scale-95 text-white shadow-sm shadow-sky-500/20 transition-all cursor-pointer"
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
                                    title="Imprimer le document (Ctrl+P)"
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
