import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    const [erreur, setErreur] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        if (erreur) setErreur('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErreur('')
        setIsSubmitting(true)

        try {
            await login(form.email, form.password)
            navigate('/dashboard')
        } catch (err) {
            setErreur(err.message)
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
                        L'organisation fluide, sans compromis sur la confidentialité.
                    </h2>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        Vos tâches et documents restent sécurisés directement dans votre navigateur, sans dépendance externe superflue.
                    </p>
                </div>

                <div />
            </div>

            <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-16">
                <div className="w-full max-w-sm space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Bienvenue</h1>
                        <p className="text-xs text-zinc-400">
                            Identifiez-vous pour accéder à vos tâches et projets en cours.
                        </p>
                    </div>

                    {erreur && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                            {erreur}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-300" htmlFor="email">
                                Identifiant e-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Adresse mail"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-zinc-300" htmlFor="password">
                                    Mot de passe
                                </label>
                            </div>
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
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-10 mt-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-sm transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? 'Connexion en cours...' : 'Continuer'}
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-xs text-zinc-400">
                            Pas de profil enregistré ?{' '}
                            <Link to="/register" className="text-zinc-200 font-medium hover:underline underline-offset-4">
                                Créer un compte
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}