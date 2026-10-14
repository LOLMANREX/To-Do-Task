const db = require('../config/db');
const path = require('path');
const fs = require('fs');

const uploadsDir = process.env.UPLOADS_PATH || (fs.existsSync('/app/uploads') ? '/app/uploads' : path.join(__dirname, '../../uploads'));
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const formatDueDate = (val) => {
    if (!val) return null;
    if (typeof val === 'string') {
        return val.split('T')[0].split(' ')[0];
    }
    if (val instanceof Date) {
        try {
            return val.toISOString().split('T')[0];
        } catch (_) {
            const y = val.getFullYear();
            const m = String(val.getMonth() + 1).padStart(2, '0');
            const d = String(val.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
    }
    return String(val);
};

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
            priority: t.priority || 'medium',
            dueDate: formatDueDate(t.due_date),
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
        const { name, description, status, priority, dueDate, dueTime } = req.body;
        const cleanDueDate = formatDueDate(dueDate);
        const taskPriority = priority || 'medium';
        const [result] = await db.execute(
            'INSERT INTO tasks (user_id, name, description, status, priority, due_date, due_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.userId, name, description || null, status || 'todo', taskPriority, cleanDueDate || null, dueTime || null]
        );
        const [newTask] = await db.execute('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        const taskData = newTask[0] || {};
        res.status(201).json({
            ...taskData,
            priority: taskData.priority || taskPriority,
            dueDate: formatDueDate(taskData.due_date) || cleanDueDate,
            dueTime: taskData.due_time || dueTime || null,
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
        const { name, description, status, priority, dueDate, dueTime } = req.body;
        
        const [task] = await db.execute('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.userId]);
        if (task.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const current = task[0];
        const updatedName = name !== undefined ? name : current.name;
        const updatedDescription = description !== undefined ? description : current.description;
        const updatedStatus = status !== undefined ? status : current.status;
        const updatedPriority = priority !== undefined ? priority : (current.priority || 'medium');
        const cleanDueDate = dueDate !== undefined ? (formatDueDate(dueDate) || null) : current.due_date;
        const updatedDueDate = cleanDueDate;
        const updatedDueTime = dueTime !== undefined ? (dueTime || null) : current.due_time;

        await db.execute(
            'UPDATE tasks SET name = ?, description = ?, status = ?, priority = ?, due_date = ?, due_time = ? WHERE id = ?',
            [updatedName, updatedDescription, updatedStatus, updatedPriority, updatedDueDate, updatedDueTime, id]
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
        
        const taskData = updatedTask[0] || {};
        res.json({
            ...taskData,
            priority: taskData.priority || updatedPriority,
            dueDate: formatDueDate(taskData.due_date) || formatDueDate(updatedDueDate),
            dueTime: taskData.due_time || updatedDueTime,
            attachment: taskData.stored_name ? `/api/uploads/${taskData.stored_name}` : null,
            attachmentName: taskData.original_name || taskData.stored_name || null,
            mimeType: taskData.mime_type || null
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
