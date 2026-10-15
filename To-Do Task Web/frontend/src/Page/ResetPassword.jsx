import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '@/services/authService'

export default function ResetPassword() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlToken = searchParams.get('token') || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : '') || ''
    const urlEmail = searchParams.get('email') || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('email') : '') || ''

    const [form, setForm] = useState({
        email: urlEmail,
        tokenOrCode: urlToken,
        password: '',
        confirmPassword: ''
    })

    useEffect(() => {
        if (urlEmail && !form.email) {
            setForm((prev) => ({ ...prev, email: urlEmail }))
        }
        if (urlToken && !form.tokenOrCode) {
            setForm((prev) => ({ ...prev, tokenOrCode: urlToken }))
        }
    }, [urlEmail, urlToken])

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [erreur, setErreur] = useState('')
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        if (erreur) setErreur('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErreur('')

        const activeToken = form.tokenOrCode || urlToken
        if (!activeToken) {
            setErreur('Veuillez fournir un code ou lien de réinitialisation valide.')
            return
        }

        if (!urlToken && !form.email) {
            setErreur("L'adresse e-mail est requise.")
            return
        }

        if (form.password.length < 6) {
            setErreur('Le nouveau mot de passe doit contenir au moins 6 caractères.')
            return
        }

        if (form.password !== form.confirmPassword) {
            setErreur('Les mots de passe ne correspondent pas.')
            return
        }

        setIsSubmitting(true)

        try {
            await authService.resetPassword({
                email: form.email || urlEmail,
                tokenOrCode: activeToken,
                token: activeToken,
                newPassword: form.password,
                password: form.password
            })
            setSuccess(true)
        } catch (err) {
            setErreur(err.message || 'Erreur lors de la réinitialisation du mot de passe.')
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
                        Choisissez un nouveau mot de passe sécurisé.
                    </h2>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        Une fois votre mot de passe mis à jour, vous pourrez vous reconnecter immédiatement à votre compte To-Do Task.
                    </p>
                </div>

                <div />
            </div>

            <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-16">
                <div className="w-full max-w-sm space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Nouveau mot de passe</h1>
                        <p className="text-xs text-zinc-400">
                            {urlToken
                                ? 'Définissez votre nouveau mot de passe pour finaliser la réinitialisation.'
                                : 'Entrez votre code de sécurité reçu par email et votre nouveau mot de passe.'}
                        </p>
                    </div>

                    {erreur && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                            {erreur}
                        </div>
                    )}

                    {success ? (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300 space-y-2 leading-relaxed">
                                <p className="font-semibold text-emerald-200 text-sm">Mot de passe réinitialisé !</p>
                                <p>
                                    Votre mot de passe a été modifié avec succès. Vous pouvez désormais vous connecter avec vos nouveaux identifiants.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="w-full h-10 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                Se connecter maintenant
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {urlToken ? (
                                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-400 space-y-1">
                                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                                        Jeton de réinitialisation détecté
                                    </div>
                                    {urlEmail && (
                                        <p className="text-[11px] text-zinc-400 truncate">
                                            Compte : {urlEmail}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-zinc-300" htmlFor="email">
                                            Identifiant e-mail
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            placeholder="exemple@domaine.com"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-zinc-300" htmlFor="tokenOrCode">
                                            Code à 6 chiffres ou Jeton
                                        </label>
                                        <input
                                            id="tokenOrCode"
                                            type="text"
                                            name="tokenOrCode"
                                            placeholder="Ex: 849201"
                                            value={form.tokenOrCode}
                                            onChange={handleChange}
                                            required
                                            className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 font-mono placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-300" htmlFor="password">
                                    Nouveau mot de passe
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Au moins 6 caractères"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-300" htmlFor="confirmPassword">
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="••••••••••••"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-10 mt-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-sm transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isSubmitting ? 'Mise à jour en cours...' : 'Enregistrer le nouveau mot de passe'}
                            </button>
                        </form>
                    )}

                    <div className="text-center pt-2">
                        <p className="text-xs text-zinc-400">
                            Retour à la page de{' '}
                            <Link to="/login" className="text-zinc-200 font-medium hover:underline underline-offset-4">
                                Connexion
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
