import { useState } from 'react'

export const DEFAULT_AVATARS = [
    {
        id: 'silhouette',
        name: 'Minimaliste',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%2327272a"/><circle cx="50" cy="38" r="18" fill="%23e4e4e7"/><path d="M22 88 A28 28 0 0 1 78 88 Z" fill="%23e4e4e7"/></svg>'
    },
    {
        id: 'emerald',
        name: 'Émeraude',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23064e3b"/><circle cx="50" cy="38" r="18" fill="%236ee7b7"/><path d="M22 88 A28 28 0 0 1 78 88 Z" fill="%236ee7b7"/></svg>'
    },
    {
        id: 'indigo',
        name: 'Indigo',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231e1b4b"/><circle cx="50" cy="38" r="18" fill="%23a5b4fc"/><path d="M22 88 A28 28 0 0 1 78 88 Z" fill="%23a5b4fc"/></svg>'
    },
    {
        id: 'amber',
        name: 'Ambre',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23451a03"/><circle cx="50" cy="38" r="18" fill="%23fcd34d"/><path d="M22 88 A28 28 0 0 1 78 88 Z" fill="%23fcd34d"/></svg>'
    }
]

export function Avatar({ user, size = 'md', className = '' }) {
    const [hasError, setHasError] = useState(false)

    const sizeClasses = {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-9 w-9',
        lg: 'h-12 w-12',
        xl: 'h-20 w-20',
        '2xl': 'h-24 w-24'
    }

    const currentSize = sizeClasses[size] || sizeClasses.md
    const avatarSrc = !hasError && user?.avatarUrl ? user.avatarUrl : DEFAULT_AVATARS[0].url

    return (
        <div className={`relative shrink-0 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm ${currentSize} ${className}`}>
            <img
                src={avatarSrc}
                alt="Avatar"
                onError={() => setHasError(true)}
                className="h-full w-full object-cover"
            />
        </div>
    )
}
