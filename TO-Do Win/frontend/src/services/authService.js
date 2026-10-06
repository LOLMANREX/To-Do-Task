export const authService = {
    async register({ firstName, lastName, email, password }) {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName, email, password }),
            credentials: 'include'
        })
        
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erreur lors de l\'inscription')
        }
        return response.json()
    },

    async login(email, password) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Identifiants incorrects')
        }
        return response.json()
    },
    
    async me() {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
        })
        
        if (!response.ok) {
            throw new Error('Non authentifié')
        }
        return response.json()
    },

    async updateProfile({ firstName, lastName }) {
        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName }),
            credentials: 'include'
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erreur mise à jour profil')
        }
        return response.json()
    },

    async uploadAvatar(file) {
        const formData = new FormData()
        formData.append('avatar', file)

        const response = await fetch('/api/auth/avatar', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erreur upload avatar')
        }
        return response.json()
    },

    async deleteAvatar() {
        const response = await fetch('/api/auth/avatar', {
            method: 'DELETE',
            credentials: 'include'
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erreur suppression avatar')
        }
        return response.json()
    },

    async setAvatarPreset(avatarUrl) {
        const response = await fetch('/api/auth/avatar-preset', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ avatarUrl }),
            credentials: 'include'
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erreur sélection avatar')
        }
        return response.json()
    }
}