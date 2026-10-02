import { db } from './db'

export const taskService = {
    async getTasksByUser(userId) {
        return await db.tasks.where('userId').equals(userId).toArray()
    },

    async createTask({ userId, name, description, dueDate }) {
        const now = new Date().toISOString()
        const newTask = {
            id: crypto.randomUUID(),
            userId,
            name: name.trim(),
            description: description ? description.trim() : '',
            status: 'todo',
            dueDate,
            createdAt: now,
            updatedAt: now,
            completedAt: null,
            documentId: null
        }

        await db.tasks.add(newTask)
        return newTask
    },

    async updateTaskStatus(taskId, status) {
        const now = new Date().toISOString()
        const updates = {
            status,
            updatedAt: now,
            completedAt: status === 'done' ? now : null
        }

        await db.tasks.update(taskId, updates)
        return await db.tasks.get(taskId)
    },

    async updateTask(taskId, { name, description, dueDate, status }) {
        const now = new Date().toISOString()
        const updates = {
            name: name.trim(),
            description: description ? description.trim() : '',
            dueDate,
            status,
            updatedAt: now,
            completedAt: status === 'done' ? now : null
        }

        await db.tasks.update(taskId, updates)
        return await db.tasks.get(taskId)
    },

    async deleteTask(taskId) {
        const task = await db.tasks.get(taskId)
        if (task && task.documentId) {
            await db.documents.delete(task.documentId)
        }
        await db.tasks.delete(taskId)
    }
}