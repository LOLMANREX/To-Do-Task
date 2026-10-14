import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker || `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`
}

/**
 * Converts a PDF file (File, Blob, ArrayBuffer, or Uint8Array) into clean Markdown.
 *
 * @param {File|Blob|ArrayBuffer|Uint8Array} fileInput
 * @param {Object} [options]
 * @param {Function} [options.onProgress] Callback with { current, total, percentage, message }
 * @param {boolean} [options.includePageDividers=true] Whether to include horizontal rules between pages
 * @returns {Promise<{ markdown: string, pageCount: number, title: string, wordCount: number, charCount: number }>}
 */
export async function convertPdfToMarkdown(fileInput, options = {}) {
    const {
        onProgress = () => {},
        includePageDividers = true
    } = options

    let arrayBuffer
    let fileName = ''

    if (fileInput instanceof File) {
        fileName = fileInput.name.replace(/\.[^/.]+$/, '')
        arrayBuffer = await fileInput.arrayBuffer()
    } else if (fileInput instanceof Blob) {
        arrayBuffer = await fileInput.arrayBuffer()
    } else if (fileInput instanceof ArrayBuffer) {
        arrayBuffer = fileInput
    } else if (fileInput && fileInput.buffer instanceof ArrayBuffer) {
        arrayBuffer = fileInput.buffer
    } else {
        throw new Error('Format de fichier PDF invalide.')
    }

    onProgress({ current: 0, total: 100, percentage: 5, message: 'Initialisation de l\'analyse PDF...' })

    let loadingTask
    let pdfDoc
    try {
        loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
            useSystemFonts: true,
            isEvalSupported: false
        })
        pdfDoc = await loadingTask.promise
    } catch (err) {
        if (err.name === 'PasswordException') {
            throw new Error('Ce document PDF est protégé par un mot de passe.')
        }
        throw new Error('Impossible de lire le document PDF. Fichier corrompu ou invalide.')
    }

    const numPages = pdfDoc.numPages
    if (numPages === 0) {
        throw new Error('Le document PDF ne contient aucune page.')
    }

    const pageResults = []
    let detectedDocumentTitle = ''
    let totalTextChars = 0

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const pct = Math.round((pageNum / numPages) * 90) + 5
        onProgress({
            current: pageNum,
            total: numPages,
            percentage: pct,
            message: `Traitement de la page ${pageNum} sur ${numPages}...`
        })

        const page = await pdfDoc.getPage(pageNum)
        const textContent = await page.getTextContent({ includeMarkedContent: false })
        const items = textContent.items || []

        // Also retrieve link annotations if any
        let linkAnnotations = []
        try {
            const annotations = await page.getAnnotations()
            linkAnnotations = (annotations || []).filter(a => a.subtype === 'Link' && (a.url || a.unsafeUrl))
        } catch (_) {}

        if (items.length === 0) {
            continue
        }

        // Group into lines by y coordinate (within 3pt or 35% font size)
        const linesMap = []
        for (const item of items) {
            const str = item.str
            if (!str && str !== ' ') continue;

            const x = item.transform[4]
            const y = item.transform[5]
            const fontSize = Math.hypot(item.transform[0], item.transform[1])
            const fontName = item.fontName || ''
            const width = item.width || 0

            // Check if item overlaps with any hyperlink annotation
            let linkUrl = null
            if (linkAnnotations.length > 0) {
                for (const ann of linkAnnotations) {
                    if (Array.isArray(ann.rect)) {
                        const [rx1, ry1, rx2, ry2] = ann.rect
                        if (x >= rx1 - 2 && x <= rx2 + 2 && y >= ry1 - 2 && y <= ry2 + 2) {
                            linkUrl = ann.url || ann.unsafeUrl
                            break
                        }
                    }
                }
            }

            let foundLine = linesMap.find(l => Math.abs(l.y - y) <= Math.max(3, fontSize * 0.35))
            if (!foundLine) {
                foundLine = { y, items: [] }
                linesMap.push(foundLine)
            }
            foundLine.items.push({
                str,
                x,
                y,
                width,
                fontSize,
                fontName,
                linkUrl,
                isBold: /bold|black|heavy|semibold/i.test(fontName),
                isItalic: /italic|oblique/i.test(fontName),
                isMono: /courier|consolas|mono|menlo|sourcecode/i.test(fontName)
            })
        }

        // Sort lines top to bottom (descending y)
        linesMap.sort((a, b) => b.y - a.y)

        // Sort items inside each line left to right (ascending x)
        for (const line of linesMap) {
            line.items.sort((a, b) => a.x - b.x)
        }

        // Calculate base font size for the page
        const fontSizeCounts = {}
        for (const line of linesMap) {
            for (const it of line.items) {
                const clean = it.str.trim()
                if (clean) {
                    const rSize = Math.round(it.fontSize * 10) / 10
                    fontSizeCounts[rSize] = (fontSizeCounts[rSize] || 0) + clean.length
                    totalTextChars += clean.length
                }
            }
        }

        let baseFontSize = 11
        let maxCount = 0
        for (const [size, count] of Object.entries(fontSizeCounts)) {
            if (count > maxCount) {
                maxCount = count
                baseFontSize = parseFloat(size)
            }
        }

        // Process columns & line metadata
        const processedLines = []
        for (const line of linesMap) {
            const columns = []
            let currentColText = ''
            let colIsBold = true
            let colIsItalic = true

            for (let i = 0; i < line.items.length; i++) {
                const item = line.items[i]

                // Check gap between words or columns
                if (i > 0) {
                    const prev = line.items[i - 1]
                    const gap = item.x - (prev.x + prev.width)
                    if (gap > 24) {
                        // Large gap signifies table column
                        if (currentColText.trim()) {
                            columns.push(currentColText.trim())
                        }
                        currentColText = ''
                    } else if (gap > 2 && !currentColText.endsWith(' ') && !item.str.startsWith(' ')) {
                        currentColText += ' '
                    }
                }

                if (!item.str.trim() && item.width > 20) {
                    if (currentColText.trim()) {
                        columns.push(currentColText.trim())
                    }
                    currentColText = ''
                    continue
                }

                // Inline formatting
                let formattedStr = item.str
                if (item.linkUrl && formattedStr.trim()) {
                    formattedStr = `[${formattedStr.trim()}](${item.linkUrl})`
                }
                currentColText += formattedStr

                if (!item.isBold && item.str.trim()) colIsBold = false
                if (!item.isItalic && item.str.trim()) colIsItalic = false
            }

            if (currentColText.trim()) {
                columns.push(currentColText.trim())
            }

            const cleanLineText = columns.join(' ').trim()
            if (!cleanLineText) continue

            const avgFontSize = line.items.reduce((acc, it) => acc + it.fontSize * it.str.length, 0) /
                Math.max(1, line.items.reduce((acc, it) => acc + it.str.length, 0))

            const isAllBold = line.items.some(it => it.str.trim()) && line.items.every(it => !it.str.trim() || it.isBold)
            const isAllMono = line.items.some(it => it.str.trim()) && line.items.every(it => !it.str.trim() || it.isMono)

            processedLines.push({
                y: line.y,
                columns,
                isMultiColumn: columns.length >= 2,
                text: cleanLineText,
                fontSize: avgFontSize || baseFontSize,
                isBold: isAllBold,
                isMono: isAllMono
            })
        }

        // Convert page lines into Markdown blocks
        const blocks = []
        let tableRows = []

        const flushTable = () => {
            if (tableRows.length >= 2) {
                const numCols = Math.max(...tableRows.map(r => r.length))
                if (numCols >= 2) {
                    let mdTable = ''
                    const header = tableRows[0]
                    const headerCells = []
                    for (let c = 0; c < numCols; c++) {
                        headerCells.push((header[c] || '').replace(/\|/g, '\\|').trim())
                    }
                    mdTable += '| ' + headerCells.join(' | ') + ' |\n'
                    mdTable += '| ' + headerCells.map(() => '---').join(' | ') + ' |\n'

                    for (let r = 1; r < tableRows.length; r++) {
                        const row = tableRows[r]
                        const rowCells = []
                        for (let c = 0; c < numCols; c++) {
                            rowCells.push((row[c] || '').replace(/\|/g, '\\|').trim())
                        }
                        mdTable += '| ' + rowCells.join(' | ') + ' |' + (r < tableRows.length - 1 ? '\n' : '')
                    }
                    blocks.push(mdTable)
                } else {
                    for (const r of tableRows) blocks.push(r.join(' '))
                }
            } else if (tableRows.length === 1) {
                blocks.push(tableRows[0].join('  '))
            }
            tableRows = []
        }

        let currentParagraph = ''
        const flushParagraph = () => {
            if (currentParagraph.trim()) {
                blocks.push(currentParagraph.trim())
                currentParagraph = ''
            }
        }

        for (let i = 0; i < processedLines.length; i++) {
            const line = processedLines[i]

            // Table rows handling
            if (line.isMultiColumn) {
                flushParagraph()
                tableRows.push(line.columns)
                continue
            } else {
                if (tableRows.length > 0) flushTable()
            }

            const txt = line.text
            if (!txt) continue

            // Code blocks
            if (line.isMono) {
                flushParagraph()
                blocks.push('```\n' + txt + '\n```')
                continue
            }

            // Headings
            if (line.fontSize >= baseFontSize * 1.55) {
                flushParagraph()
                const headingText = '# ' + txt.replace(/^#+\s*/, '')
                blocks.push(headingText)
                if (!detectedDocumentTitle) {
                    detectedDocumentTitle = txt.replace(/^#+\s*/, '')
                }
                continue
            }

            if (line.fontSize >= baseFontSize * 1.25) {
                flushParagraph()
                blocks.push('## ' + txt.replace(/^#+\s*/, ''))
                continue
            }

            if (line.fontSize >= baseFontSize * 1.12 || (line.isBold && txt.length < 75 && !/[.!?]$/.test(txt))) {
                flushParagraph()
                blocks.push('### ' + txt.replace(/^#+\s*/, ''))
                continue
            }

            // Checklist items
            const checkMatch = txt.match(/^(\[([ xX])\]|[☐☑])\s*(.*)$/)
            if (checkMatch) {
                flushParagraph()
                const isChecked = checkMatch[2]?.toLowerCase() === 'x' || checkMatch[1] === '☑'
                blocks.push(`- [${isChecked ? 'x' : ' '}] ${checkMatch[3] || ''}`)
                continue
            }

            // Bullet lists
            if (/^[•●▪▫–—]\s*/.test(txt)) {
                flushParagraph()
                blocks.push('- ' + txt.replace(/^[•●▪▫–—]\s*/, ''))
                continue
            }
            if (/^[-*+]\s+/.test(txt)) {
                flushParagraph()
                blocks.push(txt)
                continue
            }

            // Numbered lists
            if (/^\d+[\.\)]\s+/.test(txt)) {
                flushParagraph()
                blocks.push(txt.replace(/^(\d+)\)\s+/, '$1. '))
                continue
            }

            // Blockquotes
            if (txt.startsWith('> ')) {
                flushParagraph()
                blocks.push(txt)
                continue
            }

            // Horizontal dividers
            if (/^([*_-]\s*){3,}$/.test(txt)) {
                flushParagraph()
                blocks.push('---')
                continue
            }

            // Paragraph reflow
            if (currentParagraph) {
                const prevEndsSentence = /[.!?:]$/.test(currentParagraph.trim())
                const dy = i > 0 ? Math.abs(processedLines[i - 1].y - line.y) : 0
                if (!prevEndsSentence && dy < baseFontSize * 1.8) {
                    currentParagraph += ' ' + txt
                } else {
                    flushParagraph()
                    currentParagraph = txt
                }
            } else {
                currentParagraph = txt
            }
        }

        flushParagraph()
        if (tableRows.length > 0) flushTable()

        if (blocks.length > 0) {
            pageResults.push(blocks.join('\n\n'))
        }
    }

    onProgress({ current: numPages, total: numPages, percentage: 100, message: 'Finalisation du document Markdown...' })

    let fullMarkdown = pageResults.join(includePageDividers ? '\n\n---\n\n' : '\n\n')

    // If scanned image PDF with zero text detected
    if (totalTextChars === 0) {
        fullMarkdown = `> [!WARNING] Ce document PDF semble être une image scannée ou ne contient pas de couche de texte sélectionnable.\n\n`
    }

    const title = detectedDocumentTitle || fileName || 'Document importé'
    const wordCount = fullMarkdown.trim() ? fullMarkdown.trim().split(/\s+/).length : 0
    const charCount = fullMarkdown.length

    return {
        markdown: fullMarkdown,
        pageCount: numPages,
        title,
        wordCount,
        charCount
    }
}
