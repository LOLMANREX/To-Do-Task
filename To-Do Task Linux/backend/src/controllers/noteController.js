const db = require('../config/db');

exports.getNotes = async (req, res) => {
    try {
        const [notes] = await db.execute(
            'SELECT * FROM notes WHERE user_id = ? ORDER BY pinned DESC, updated_at DESC, id DESC',
            [req.userId]
        );
        const formatted = (notes || []).map(n => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            content: n.content || '',
            pinned: Boolean(n.pinned),
            createdAt: n.created_at,
            updatedAt: n.updated_at
        }));
        res.json(formatted);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ message: 'Erreur lors du chargement des documents' });
    }
};

exports.getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const [notes] = await db.execute(
            'SELECT * FROM notes WHERE id = ? AND user_id = ?',
            [id, req.userId]
        );
        if (!notes || notes.length === 0) {
            return res.status(404).json({ message: 'Document introuvable' });
        }
        const n = notes[0];
        res.json({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            content: n.content || '',
            pinned: Boolean(n.pinned),
            createdAt: n.created_at,
            updatedAt: n.updated_at
        });
    } catch (error) {
        console.error('Error fetching note by id:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du document' });
    }
};

exports.createNote = async (req, res) => {
    try {
        const rawTitle = typeof req.body.title === 'string' ? req.body.title.trim() : '';
        const title = rawTitle.length > 0 ? rawTitle : 'Document sans titre';
        const content = typeof req.body.content === 'string' ? req.body.content : '';
        const pinned = req.body.pinned ? 1 : 0;

        const [result] = await db.execute(
            'INSERT INTO notes (user_id, title, content, pinned) VALUES (?, ?, ?, ?)',
            [req.userId, title, content, pinned]
        );

        const [newNotes] = await db.execute('SELECT * FROM notes WHERE id = ?', [result.insertId]);
        const n = newNotes[0];
        res.status(201).json({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            content: n.content || '',
            pinned: Boolean(n.pinned),
            createdAt: n.created_at,
            updatedAt: n.updated_at
        });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ message: 'Erreur lors de la création du document' });
    }
};

exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const [notes] = await db.execute(
            'SELECT * FROM notes WHERE id = ? AND user_id = ?',
            [id, req.userId]
        );
        if (!notes || notes.length === 0) {
            return res.status(404).json({ message: 'Document introuvable' });
        }
        const current = notes[0];

        let title = current.title;
        if (typeof req.body.title === 'string') {
            const trimmed = req.body.title.trim();
            title = trimmed.length > 0 ? trimmed : 'Document sans titre';
        }

        const content = typeof req.body.content === 'string' ? req.body.content : (current.content || '');
        const pinned = req.body.pinned !== undefined ? (req.body.pinned ? 1 : 0) : current.pinned;

        await db.execute(
            'UPDATE notes SET title = ?, content = ?, pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            [title, content, pinned, id, req.userId]
        );

        const [updatedNotes] = await db.execute('SELECT * FROM notes WHERE id = ?', [id]);
        const n = updatedNotes[0];
        res.json({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            content: n.content || '',
            pinned: Boolean(n.pinned),
            createdAt: n.created_at,
            updatedAt: n.updated_at
        });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du document' });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const [notes] = await db.execute(
            'SELECT id FROM notes WHERE id = ? AND user_id = ?',
            [id, req.userId]
        );
        if (!notes || notes.length === 0) {
            return res.status(404).json({ message: 'Document introuvable' });
        }
        await db.execute('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, req.userId]);
        res.json({ message: 'Document supprimé avec succès' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du document' });
    }
};
