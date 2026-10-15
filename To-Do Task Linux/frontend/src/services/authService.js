import { apiUrl } from '../lib/api';

export const authService = {
    async register({ firstName, lastName, email, password }) {
        const response = await fetch(apiUrl('/api/auth/register'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName, email, password }),
            credentials: 'include'
        })
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Erreur lors de l\'inscription')
        }
        return response.json()
    },

    async login(email, password) {
        const response = await fetch(apiUrl('/api/auth/login'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Identifiants incorrects')
        }
        return response.json()
    },
    
    async me() {
        const response = await fetch(apiUrl('/api/auth/me'), {
            method: 'GET',
            credentials: 'include'
        })
        
        if (!response.ok) {
            throw new Error('Non authentifié')
        }
        return response.json()
    },

    async updateProfile({ firstName, lastName }) {
        const response = await fetch(apiUrl('/api/auth/profile'), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName }),
            credentials: 'include'
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Erreur mise à jour profil')
        }
        return response.json()
    },

    async uploadAvatar(file) {
        const formData = new FormData()
        formData.append('avatar', file)

        const response = await fetch(apiUrl('/api/auth/avatar'), {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Erreur upload avatar')
        }
        return response.json()
    },

    async deleteAvatar() {
        const response = await fetch(apiUrl('/api/auth/avatar'), {
            method: 'DELETE',
            credentials: 'include'
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Erreur suppression avatar')
        }
        return response.json()
    },

    async setAvatarPreset(avatarUrl) {
        const response = await fetch(apiUrl('/api/auth/avatar-preset'), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ avatarUrl }),
            credentials: 'include'
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Erreur sélection avatar')
        }
        return response.json()
    },

    async forgotPassword(email) {
        const response = await fetch(apiUrl('/api/auth/forgot-password'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }),
            credentials: 'include'
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de la demande de réinitialisation')
        }
        return data
    },

    async resetPassword({ email, tokenOrCode, token, newPassword, password }) {
        const payloadToken = token || tokenOrCode
        const payloadPassword = newPassword || password
        const response = await fetch(apiUrl('/api/auth/reset-password'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                token: payloadToken,
                tokenOrCode: payloadToken,
                newPassword: payloadPassword,
                password: payloadPassword
            }),
            credentials: 'include'
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de la réinitialisation du mot de passe')
        }
        return data
    }
}