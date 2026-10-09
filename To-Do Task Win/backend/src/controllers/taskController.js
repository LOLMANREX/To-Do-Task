const db = require('../config/db');
const path = require('path');
const fs = require('fs');

const uploadsDir = process.env.UPLOADS_PATH || (fs.existsSync('/app/uploads') ? '/app/uploads' : path.join(__dirname, '../../uploads'));
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

exports.getTasks = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.*,
                d.id AS document_id,
                d.stored_name,
                d.original_name,
                d.mime_type
            FROM tasks t
            LEFT JOIN documents d ON t.id = d.task_id
            WHERE t.user_id = ? 
            ORDER BY t.id DESC
        `;
        const [tasks] = await db.execute(query, [req.userId]);
        const formattedTasks = tasks.map(t => ({
            ...t,
            dueDate: t.due_date,
            dueTime: t.due_time,
            attachment: t.stored_name ? `/api/uploads/${t.stored_name}` : null,
            attachmentName: t.original_name || t.stored_name || null,
            mimeType: t.mime_type || null
        }));
        res.json(formattedTasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { name, description, status, dueDate, dueTime } = req.body;
        const [result] = await db.execute(
            'INSERT INTO tasks (user_id, name, description, status, due_date, due_time) VALUES (?, ?, ?, ?, ?, ?)',
            [req.userId, name, description || null, status || 'todo', dueDate || null, dueTime || null]
        );
        const [newTask] = await db.execute('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        res.status(201).json({
            ...newTask[0],
            dueDate: newTask[0].due_date,
            dueTime: newTask[0].due_time,
            attachment: null,
            attachmentName: null,
            mimeType: null
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status, dueDate, dueTime } = req.body;
        
        const [task] = await db.execute('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.userId]);
        if (task.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const current = task[0];
        const updatedName = name !== undefined ? name : current.name;
        const updatedDescription = description !== undefined ? description : current.description;
        const updatedStatus = status !== undefined ? status : current.status;
        const updatedDueDate = dueDate !== undefined ? (dueDate || null) : current.due_date;
        const updatedDueTime = dueTime !== undefined ? (dueTime || null) : current.due_time;

        await db.execute(
            'UPDATE tasks SET name = ?, description = ?, status = ?, due_date = ?, due_time = ? WHERE id = ?',
            [updatedName, updatedDescription, updatedStatus, updatedDueDate, updatedDueTime, id]
        );
        
        const [updatedTask] = await db.execute(`
            SELECT 
                t.*,
                d.id AS document_id,
                d.stored_name,
                d.original_name,
                d.mime_type
            FROM tasks t
            LEFT JOIN documents d ON t.id = d.task_id
            WHERE t.id = ?
        `, [id]);
        
        res.json({
            ...updatedTask[0],
            dueDate: updatedTask[0].due_date,
            dueTime: updatedTask[0].due_time,
            attachment: updatedTask[0].stored_name ? `/api/uploads/${updatedTask[0].stored_name}` : null,
            attachmentName: updatedTask[0].original_name || updatedTask[0].stored_name || null,
            mimeType: updatedTask[0].mime_type || null
        });
    } catch (error) {
        console.error('Error in updateTask:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [task] = await db.execute('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.userId]);
        if (task.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Clean up attached physical files
        const [docs] = await db.execute('SELECT stored_name FROM documents WHERE task_id = ?', [id]);
        for (const doc of docs) {
            const filePath = path.join(uploadsDir, doc.stored_name);
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) { }
            }
        }

        await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ message: 'Task deleted' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { id } = req.params;
        const [task] = await db.execute('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.userId]);
        if (task.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const { filename, originalname, mimetype } = req.file;

        // Clean up previous files if any
        const [existingDocs] = await db.execute('SELECT stored_name FROM documents WHERE task_id = ?', [id]);
        for (const doc of existingDocs) {
            const oldPath = path.join(uploadsDir, doc.stored_name);
            if (fs.existsSync(oldPath)) {
                try { fs.unlinkSync(oldPath); } catch (e) { }
            }
        }
        await db.execute('DELETE FROM documents WHERE task_id = ?', [id]);

        await db.execute(
            'INSERT INTO documents (task_id, stored_name, original_name, mime_type) VALUES (?, ?, ?, ?)',
            [id, filename, originalname, mimetype]
        );
        
        res.status(201).json({ 
            message: 'File uploaded successfully', 
            stored_name: filename,
            original_name: originalname,
            mime_type: mimetype,
            url: `/api/uploads/${filename}`,
            attachment: `/api/uploads/${filename}`,
            attachmentName: originalname,
            mimeType: mimetype
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
