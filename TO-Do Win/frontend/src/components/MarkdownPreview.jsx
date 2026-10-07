import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

function parseInlineTokens(text) {
    if (!text) return text
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|`[^`]+`|\[[^\]]+\]\([^)]+\)|<u>.*?<\/u>)/g
    const parts = text.split(regex)

    return parts.map((part, i) => {
        if (!part) return null
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-zinc-900 dark:text-zinc-100">{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i} className="italic text-zinc-800 dark:text-zinc-200">{part.slice(1, -1)}</em>
        }
        if (part.startsWith('~~') && part.endsWith('~~')) {
            return <del key={i} className="line-through text-zinc-500 dark:text-zinc-400">{part.slice(2, -2)}</del>
        }
        if (part.startsWith('<u>') && part.endsWith('</u>')) {
            return <u key={i} className="underline underline-offset-2">{part.slice(3, -4)}</u>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={i} className="px-1.5 py-0.5 text-xs font-mono rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-sky-600 dark:text-sky-300 border border-zinc-300/60 dark:border-zinc-700/60">
                    {part.slice(1, -1)}
                </code>
            )
        }
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (linkMatch) {
            return (
                <a
                    key={i}
                    href={linkMatch[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
                >
                    {linkMatch[1]}
                </a>
            )
        }
        return <span key={i}>{part}</span>
    }).filter(Boolean)
}

function CodeBlock({ code, lang }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative group my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 shadow-sm">
            <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-950/80 border-b border-zinc-800 text-xs text-zinc-400">
                <span className="font-mono uppercase tracking-wider">{lang || 'Code'}</span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-300"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
            </div>
            <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    )
}

export default function MarkdownPreview({ content, onToggleTask, className = '' }) {
    if (!content || !content.trim()) {
        return (
            <div className={`p-8 text-center text-zinc-400 dark:text-zinc-500 italic select-none ${className}`}>
                Ce document est vide. Utilisez la barre d'outils ou commencez à écrire dans l'éditeur.
            </div>
        )
    }

    const lines = content.split('\n')
    const elements = []
    let inCodeBlock = false
    let codeBuffer = []
    let codeLang = ''

    let tableBuffer = []

    const flushTable = () => {
        if (tableBuffer.length === 0) return
        const headerRow = tableBuffer[0]
        const dataRows = tableBuffer.slice(2) // Skip separator row
        elements.push(
            <div key={`table-${elements.length}`} className="my-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100">
                        <tr>
                            {headerRow.map((cell, idx) => (
                                <th key={idx} className="px-4 py-2 font-semibold border-b border-zinc-200 dark:border-zinc-700">
                                    {parseInlineTokens(cell)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {dataRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
                                        {parseInlineTokens(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
        tableBuffer = []
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Handle code blocks
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                elements.push(
                    <CodeBlock
                        key={`code-${i}`}
                        code={codeBuffer.join('\n')}
                        lang={codeLang}
                    />
                )
                codeBuffer = []
                codeLang = ''
                inCodeBlock = false
            } else {
                flushTable()
                inCodeBlock = true
                codeLang = line.trim().slice(3).trim()
            }
            continue
        }

        if (inCodeBlock) {
            codeBuffer.push(line)
            continue
        }

        // Handle tables: lines starting and ending with |
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            const cells = line.split('|').slice(1, -1).map(c => c.trim())
            tableBuffer.push(cells)
            continue
        } else {
            flushTable()
        }

        // Dividers
        if (/^(\*\*\*|---|___)$/.test(line.trim())) {
            elements.push(
                <hr key={`hr-${i}`} className="my-6 border-zinc-200 dark:border-zinc-800" />
            )
            continue
        }

        // Headings
        if (line.startsWith('# ')) {
            elements.push(
                <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-6 mb-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50">
                    {parseInlineTokens(line.slice(2))}
                </h1>
            )
            continue
        }
        if (line.startsWith('## ')) {
            elements.push(
                <h2 key={`h2-${i}`} className="text-xl sm:text-2xl font-bold tracking-tight mt-5 mb-2.5 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100">
                    {parseInlineTokens(line.slice(3))}
                </h2>
            )
            continue
        }
        if (line.startsWith('### ')) {
            elements.push(
                <h3 key={`h3-${i}`} className="text-lg sm:text-xl font-semibold tracking-tight mt-4 mb-2 text-zinc-900 dark:text-zinc-100">
                    {parseInlineTokens(line.slice(4))}
                </h3>
            )
            continue
        }
        if (line.startsWith('#### ')) {
            elements.push(
                <h4 key={`h4-${i}`} className="text-base font-semibold mt-3 mb-1.5 text-zinc-800 dark:text-zinc-200">
                    {parseInlineTokens(line.slice(5))}
                </h4>
            )
            continue
        }

        // Blockquotes
        if (line.startsWith('> ')) {
            elements.push(
                <blockquote
                    key={`quote-${i}`}
                    className="my-3 pl-4 py-1.5 border-l-4 border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 rounded-r-xl italic text-zinc-700 dark:text-zinc-300"
                >
                    {parseInlineTokens(line.slice(2))}
                </blockquote>
            )
            continue
        }

        // Checklists: - [ ] or - [x]
        const taskMatch = line.match(/^(\s*)[-*]\s*\[([ xX])\]\s*(.*)$/)
        if (taskMatch) {
            const indent = taskMatch[1].length
            const isChecked = taskMatch[2].toLowerCase() === 'x'
            const itemText = taskMatch[3]

            elements.push(
                <div
                    key={`task-${i}`}
                    style={{ paddingLeft: `${indent * 12}px` }}
                    className="flex items-start gap-2.5 my-1.5 group"
                >
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                            if (onToggleTask) onToggleTask(i)
                        }}
                        className="mt-1 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer accent-sky-600"
                    />
                    <span className={`text-sm leading-relaxed ${isChecked ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                        {parseInlineTokens(itemText)}
                    </span>
                </div>
            )
            continue
        }

        // Unordered lists (- or *)
        const bulletMatch = line.match(/^(\s*)[-*+]\s+(.*)$/)
        if (bulletMatch) {
            const indent = bulletMatch[1].length
            elements.push(
                <div
                    key={`bullet-${i}`}
                    style={{ paddingLeft: `${indent * 12}px` }}
                    className="flex items-start gap-2.5 my-1"
                >
                    <span className="text-sky-500 dark:text-sky-400 font-bold leading-relaxed">•</span>
                    <span className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                        {parseInlineTokens(bulletMatch[2])}
                    </span>
                </div>
            )
            continue
        }

        // Ordered lists (1., 2.)
        const numMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/)
        if (numMatch) {
            const indent = numMatch[1].length
            const num = numMatch[2]
            elements.push(
                <div
                    key={`num-${i}`}
                    style={{ paddingLeft: `${indent * 12}px` }}
                    className="flex items-start gap-2.5 my-1"
                >
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 pt-0.5 min-w-[18px]">
                        {num}.
                    </span>
                    <span className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                        {parseInlineTokens(numMatch[3])}
                    </span>
                </div>
            )
            continue
        }

        // Empty lines
        if (!line.trim()) {
            elements.push(<div key={`empty-${i}`} className="h-3" />)
            continue
        }

        // Regular paragraph
        elements.push(
            <p key={`p-${i}`} className="my-1 text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
                {parseInlineTokens(line)}
            </p>
        )
    }

    if (inCodeBlock && codeBuffer.length > 0) {
        elements.push(
            <CodeBlock
                key="code-last"
                code={codeBuffer.join('\n')}
                lang={codeLang}
            />
        )
    }

    flushTable()

    return <div className={`prose-sm max-w-none ${className}`}>{elements}</div>
}
