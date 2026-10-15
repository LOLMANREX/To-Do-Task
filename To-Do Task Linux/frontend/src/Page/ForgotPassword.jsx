import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'

export default function ForgotPassword() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [erreur, setErreur] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErreur('')
        setSuccessMessage('')
        setIsSubmitting(true)

        try {
            const data = await authService.forgotPassword(email)
            setSuccessMessage(data.message || 'Un email contenant le code et le lien de réinitialisation a été envoyé.')
        } catch (err) {
            setErreur(err.message || 'Impossible d\'envoyer l\'email de réinitialisation.')
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
                        Récupérez l'accès à votre espace en toute sécurité.
                    </h2>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        Un lien sécurisé ainsi qu'un code à 6 chiffres vous seront envoyés directement par email pour réinitialiser votre mot de passe.
                    </p>
                </div>

                <div />
            </div>

            <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-16">
                <div className="w-full max-w-sm space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Mot de passe oublié</h1>
                        <p className="text-xs text-zinc-400">
                            Entrez votre adresse e-mail associée à votre compte To-Do Task.
                        </p>
                    </div>

                    {erreur && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                            {erreur}
                        </div>
                    )}

                    {successMessage ? (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300 space-y-2 leading-relaxed">
                                <p className="font-semibold text-emerald-200">Demande enregistrée</p>
                                <p>{successMessage}</p>
                                <p className="text-[11px] text-zinc-400">
                                    Vérifiez votre boîte de réception (et vos spams). Le code et le lien restent valides pendant 15 minutes.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                                className="w-full h-10 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                J'ai mon code / Continuer
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setSuccessMessage('')
                                    setEmail('')
                                }}
                                className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 font-medium text-xs transition cursor-pointer"
                            >
                                Utiliser une autre adresse
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-300" htmlFor="email">
                                    Adresse e-mail
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="exemple@domaine.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if (erreur) setErreur('')
                                    }}
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-10 mt-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-sm transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isSubmitting ? 'Envoi en cours...' : 'Envoyer les instructions'}
                            </button>
                        </form>
                    )}

                    <div className="text-center pt-2">
                        <p className="text-xs text-zinc-400">
                            Vous vous souvenez de votre mot de passe ?{' '}
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
