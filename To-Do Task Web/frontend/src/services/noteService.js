const checkResponse = async (response) => {
    if (response.status === 401) {
        window.dispatchEvent(new Event('unauthorized'))
        throw new Error('Non autorisé')
    }
    if (!response.ok) {
        let message = 'Erreur réseau'
        try {
            const data = await response.json()
            if (data && data.message) message = data.message
        } catch (_) {}
        throw new Error(message)
    }
    return response.json()
}

export const noteService = {
    async getNotes() {
        const response = await fetch('/api/notes', {
            method: 'GET',
            credentials: 'include'
        })
        return checkResponse(response)
    },

    async getNote(id) {
        const response = await fetch(`/api/notes/${id}`, {
            method: 'GET',
            credentials: 'include'
        })
        return checkResponse(response)
    },

    async createNote(data) {
        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
        return checkResponse(response)
    },

    async updateNote(id, data) {
        const response = await fetch(`/api/notes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
        return checkResponse(response)
    },

    async deleteNote(id) {
        const response = await fetch(`/api/notes/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        return checkResponse(response)
    },

    // LocalStorage resilient backup caching
    getLocalBackup(userId, noteId) {
        try {
            const key = `todo_doc_draft_${userId || 'guest'}_${noteId}`
            const raw = localStorage.getItem(key)
            return raw ? JSON.parse(raw) : null
        } catch (e) {
            return null
        }
    },

    saveLocalBackup(userId, noteId, data) {
        try {
            const key = `todo_doc_draft_${userId || 'guest'}_${noteId}`
            localStorage.setItem(key, JSON.stringify({
                ...data,
                savedAt: Date.now()
            }))
        } catch (e) {}
    },

    removeLocalBackup(userId, noteId) {
        try {
            const key = `todo_doc_draft_${userId || 'guest'}_${noteId}`
            localStorage.removeItem(key)
        } catch (e) {}
    }
}
