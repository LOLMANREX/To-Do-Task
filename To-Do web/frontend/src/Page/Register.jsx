import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const [erreurs, setErreurs] = useState({})
    const [erreurGlobale, setErreurGlobale] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        if (erreurs[e.target.name]) {
            setErreurs({ ...erreurs, [e.target.name]: '' })
        }
    }

    const valider = () => {
        const err = {}
        if (form.firstName.trim().length < 2) err.firstName = '2 caractères minimum'
        if (form.lastName.trim().length < 2) err.lastName = '2 caractères minimum'

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(form.email)) err.email = 'Format d’e-mail invalide'

        const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
        if (!pwdRegex.test(form.password)) {
            err.password = '8 caractères min., avec 1 majuscule, 1 minuscule et 1 chiffre'
        }

        if (form.password !== form.confirmPassword) {
            err.confirmPassword = 'Les mots de passe ne correspondent pas'
        }

        setErreurs(err)
        return Object.keys(err).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErreurGlobale('')

        if (!valider()) return

        setIsSubmitting(true)
        try {
            await register({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password
            })
            navigate('/dashboard')
        } catch (err) {
            setErreurGlobale(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-zinc-950 text-zinc-100">
            <div className="hidden lg:flex flex-col justify-between p-12 border-r border-zinc-800/80 bg-zinc-900/30">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold text-sm tracking-tight">
                        T
                    </div>
                    <span className="font-semibold tracking-tight text-sm text-zinc-200">To-Do Task</span>
                </div>

                <div className="space-y-4 max-w-md my-auto">
                    <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">
                        Créez votre espace de travail personnel.
                    </h2>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        Une gestion de projet locale, rapide et totalement sous votre contrôle, hébergée sur votre navigateur via IndexedDB.
                    </p>
                </div>

                <div />
            </div>

            <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-16 overflow-y-auto">
                <div className="w-full max-w-sm space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Inscription</h1>
                        <p className="text-xs text-zinc-400">
                            Renseignez vos informations pour configurer votre compte.
                        </p>
                    </div>

                    {erreurGlobale && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                            {erreurGlobale}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-300" htmlFor="firstName">
                                    Prénom
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    name="firstName"
                                    placeholder="Jean"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                                />
                                {erreurs.firstName && (
                                    <p className="text-red-400 text-[11px] mt-1">{erreurs.firstName}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-300" htmlFor="lastName">
                                    Nom
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    name="lastName"
                                    placeholder="Dupont"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                                />
                                {erreurs.lastName && (
                                    <p className="text-red-400 text-[11px] mt-1">{erreurs.lastName}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-300" htmlFor="email">
                                Identifiant e-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="nom@saint-gab.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                            />
                            {erreurs.email && (
                                <p className="text-red-400 text-[11px] mt-1">{erreurs.email}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-300" htmlFor="password">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                            />
                            {erreurs.password && (
                                <p className="text-red-400 text-[11px] mt-1">{erreurs.password}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-300" htmlFor="confirmPassword">
                                Confirmation du mot de passe
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••••••"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                            />
                            {erreurs.confirmPassword && (
                                <p className="text-red-400 text-[11px] mt-1">{erreurs.confirmPassword}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-10 mt-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-sm transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? 'Création en cours...' : 'Créer un profil'}
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-xs text-zinc-400">
                            Déjà enregistré ?{' '}
                            <Link to="/login" className="text-zinc-200 font-medium hover:underline underline-offset-4">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}