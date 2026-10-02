import { db } from './db'

async function hashPassword(password) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const authService = {
    async register({ firstName, lastName, email, password }) {
        const emailNormalise = email.toLowerCase().trim()
        const existant = await db.users.where('email').equals(emailNormalise).first()

        if (existant) {
            throw new Error('Adresse mail déjà utilisé')
        }

        const passwordHash = await hashPassword(password)
        const newUser = {
            id: crypto.randomUUID(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: emailNormalise,
            passwordHash,
            createdAt: new Date().toISOString()
        }

        await db.users.add(newUser)
        const { passwordHash: _, ...userSansMdp } = newUser
        return userSansMdp
    },

    async login(email, password) {
        const emailNormalise = email.toLowerCase().trim()
        const user = await db.users.where('email').equals(emailNormalise).first()

        if (!user) {
            throw new Error('Identifiants incorrects')
        }

        const passwordHash = await hashPassword(password)
        if (user.passwordHash !== passwordHash) {
            throw new Error('Identifiants incorrects')
        }

        const { passwordHash: _, ...userSansMdp } = user
        return userSansMdp
    }
}