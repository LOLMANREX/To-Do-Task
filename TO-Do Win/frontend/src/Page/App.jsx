import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { taskService } from '@/services/taskService'
import { FileText, Download, X, ExternalLink } from 'lucide-react'

export default function App() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachment, setAttachment] = useState(null)
  const [attachmentName, setAttachmentName] = useState(null)

  const todayStr = new Date().toISOString().split('T')[0]

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) {
      setAttachment(null)
      setAttachmentName(null)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Le fichier dépasse 5 Mo.')
      setAttachment(null)
      setAttachmentName(null)
      e.target.value = ''
      return
    }
    setFormError('')
    setAttachment(file)
    setAttachmentName(file.name)
  }

  const handleRemoveFile = () => {
    setAttachment(null)
    setAttachmentName(null)
    const fileInput = document.getElementById('file-upload')
    if (fileInput) fileInput.value = ''
  }

  useEffect(() => {
    async function chargerTaches() {
      if (!user) return
      try {
        const donnees = await taskService.getTasksByUser(user.id)
        setTasks(donnees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    chargerTaches()
  }, [user])

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setFormError('')

    const nomNettoye = name.trim()
    if (nomNettoye.length < 3 || nomNettoye.length > 100) {
      setFormError('Le titre doit contenir entre 3 et 100 caractères.')
      return
    }
    if (!dueDate) {
      setFormError('La date d’échéance est obligatoire.')
      return
    }
    if (dueDate < todayStr) {
      setFormError('L’échéance ne peut pas être antérieure à aujourd’hui.')
      return
    }

    setIsSubmitting(true)
    try {
      const nouvelleTache = await taskService.createTask({
        userId: user.id,
        name: nomNettoye,
        description,
        dueDate,
        attachment,
        attachmentName
      })
      nouvelleTache.priority = priority
      setTasks((prev) => [nouvelleTache, ...prev])
      setName('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
      setAttachment(null)
      setAttachmentName(null)
      const fileInput = document.getElementById('file-upload')
      if (fileInput) fileInput.value = ''
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    const previousTasks = [...tasks]
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
    try {
      const updated = await taskService.updateTaskStatus(taskId, newStatus)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updated, status: newStatus } : t)))
    } catch (err) {
      console.error('Erreur mise à jour statut:', err)
      setTasks(previousTasks)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (err) {
      console.error(err)
    }
  }

  const tasksFiltrees = tasks.filter((t) => {
    if (filter === 'all') return true
    return t.status === filter
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">Mes Tâches</h1>
        <p className="text-slate-500 dark:text-zinc-400 mt-1">Gérez vos objectifs et vos priorités.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="md:col-span-1">
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 shadow-sm">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-zinc-200 mb-4">Nouvelle tâche</h2>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-600 dark:text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">Titre</label>
                <input
                  type="text"
                  placeholder="Ex : Rédiger le rapport"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-zinc-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">Priorité</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-zinc-500 transition cursor-pointer"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">Date d'échéance</label>
                <input
                  type="date"
                  min={todayStr}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-zinc-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">Pièce jointe</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="flex-1 h-9 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-slate-200 dark:file:bg-zinc-800 file:text-slate-900 dark:file:text-zinc-100 hover:file:bg-slate-300 dark:hover:file:bg-zinc-700 transition cursor-pointer border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                  {attachmentName && (
                    <button type="button" onClick={handleRemoveFile} className="h-9 px-2.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition cursor-pointer flex items-center justify-center shrink-0">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 mt-2 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-sm hover:opacity-90 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Ajout...' : 'Créer la tâche'}
              </button>
            </form>
          </div>
        </section>

        <section className="md:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-3">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-zinc-200">
              Liste ({tasksFiltrees.length})
            </h2>

            <div className="flex bg-slate-100 dark:bg-zinc-900/50 p-1 rounded-lg">
              {[
                { label: 'Toutes', value: 'all' },
                { label: 'À faire', value: 'todo' },
                { label: 'En cours', value: 'in_progress' },
                { label: 'Fait', value: 'done' }
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${filter === btn.value
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 py-6 text-center">Chargement des données...</p>
          ) : tasksFiltrees.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-zinc-800 p-12 text-center flex flex-col items-center">
              <p className="text-sm text-slate-500 dark:text-zinc-500 font-medium">Aucune tâche pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasksFiltrees.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-semibold ${t.status === 'done' ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-900 dark:text-zinc-200'
                          }`}
                      >
                        {t.name}
                      </h3>
                      {t.priority === 'high' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 uppercase">Urgent</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-zinc-500 font-medium">
                      <span className={t.dueDate < todayStr && t.status !== 'done' ? 'text-red-500 font-bold' : ''}>
                        📅 {t.dueDate}
                      </span>
                      {t.completedAt && <span> Fait le {t.completedAt.split('T')[0]}</span>}
                    </div>
                    {t.attachment && (() => {
                      const isImage = t.mimeType?.startsWith('image/') || 
                        /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(t.attachmentName || t.attachment) ||
                        t.attachment.startsWith('data:image');

                      return (
                        <div className="pt-2 flex items-center gap-3">
                          {isImage ? (
                            <a
                              href={t.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Consulter ${t.attachmentName || 'l\'image'}`}
                              className="group/img relative inline-block transition-transform hover:scale-105 cursor-pointer"
                            >
                              <img
                                src={t.attachment}
                                alt={t.attachmentName || 'Pièce jointe'}
                                className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-zinc-700 shadow-sm group-hover/img:shadow-md transition-shadow"
                              />
                              <div className="absolute inset-0 rounded-lg bg-black/0 group-hover/img:bg-black/30 flex items-center justify-center transition-colors">
                                <ExternalLink size={14} className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow" />
                              </div>
                            </a>
                          ) : (
                            <a
                              href={t.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Consulter le fichier"
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition shadow-sm text-slate-700 dark:text-zinc-200 text-xs font-medium cursor-pointer group"
                            >
                              <FileText size={15} className="text-sky-500 shrink-0" />
                              <span className="truncate max-w-[150px]">{t.attachmentName || 'Document'}</span>
                              <ExternalLink size={13} className="opacity-60 group-hover:opacity-100" />
                            </a>
                          )}

                          <a
                            href={t.attachment}
                            download={t.attachmentName || 'document'}
                            title="Télécharger"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      )
                    })()}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={t.status || 'todo'}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      className="h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-700 dark:text-zinc-300 outline-none focus:border-zinc-500 cursor-pointer"
                    >
                      <option value="todo">À faire</option>
                      <option value="in_progress">En cours</option>
                      <option value="done">Terminée</option>
                    </select>

                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="h-8 px-3 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium transition cursor-pointer"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}