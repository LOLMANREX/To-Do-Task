import Dexie from 'dexie'

export const db = new Dexie('TodoAppDB')

db.version(1).stores({
    users: '&id, &email',
    tasks: '&id, userId, status, dueDate, createdAt',
    documents: '&id, taskId'
})