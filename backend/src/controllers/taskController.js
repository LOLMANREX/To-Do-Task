const db = require('../config/db');
const path = require('path');

exports.getTasks = async (req, res) => {
    try {
        const [tasks] = await db.execute('SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC', [req.userId]);
        const formattedTasks = tasks.map(t => ({
            ...t,
            dueDate: t.due_date,
            dueTime: t.due_time
        }));
        res.json(formattedTasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { name, description, status, dueDate, dueTime } = req.body;
        const [result] = await db.execute(
            'INSERT INTO tasks (user_id, name, description, status, due_date, due_time) VALUES (?, ?, ?, ?, ?, ?)',
            [req.userId, name, description, status || 'todo', dueDate || null, dueTime || null]
        );
        const [newTask] = await db.execute('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        res.status(201).json({
            ...newTask[0],
            dueDate: newTask[0].due_date,
            dueTime: newTask[0].due_time
        });
    } catch (error) {
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

        await db.execute(
            'UPDATE tasks SET name = ?, description = ?, status = ?, due_date = ?, due_time = ? WHERE id = ?',
            [name, description, status, dueDate || null, dueTime || null, id]
        );
        
        const [updatedTask] = await db.execute('SELECT * FROM tasks WHERE id = ?', [id]);
        res.json({
            ...updatedTask[0],
            dueDate: updatedTask[0].due_date,
            dueTime: updatedTask[0].due_time
        });
    } catch (error) {
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

        await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ message: 'Task deleted' });
    } catch (error) {
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

        const { filename, mimetype } = req.file;
        await db.execute(
            'INSERT INTO documents (task_id, stored_name, mime_type) VALUES (?, ?, ?)',
            [id, filename, mimetype]
        );
        
        res.status(201).json({ message: 'File uploaded successfully', stored_name: filename });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
