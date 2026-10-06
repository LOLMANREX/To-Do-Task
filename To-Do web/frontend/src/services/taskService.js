const checkResponse = async (response) => {
    if (response.status === 401) {
        window.dispatchEvent(new Event('unauthorized'))
        throw new Error('Non autorisé')
    }
    if (!response.ok) {
        throw new Error('Erreur réseau')
    }
    return response.json()
}

export const taskService = {
    async getTasksByUser() {
        const response = await fetch('/api/tasks', {
            method: 'GET',
            credentials: 'include'
        })
        return checkResponse(response)
    },

    async createTask(data) {
        let attachment = null

        if (data.attachment && data.attachment instanceof File) {
            attachment = data.attachment
            delete data.attachment
            delete data.attachmentName
        } else {
            delete data.attachment
            delete data.attachmentName
        }

        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
        const createdTask = await checkResponse(response)

        if (attachment) {
            const formData = new FormData()
            formData.append('document', attachment)
            const uploadResponse = await fetch(`/api/tasks/${createdTask.id}/document`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            })
            const uploadedDoc = await checkResponse(uploadResponse)
            return {
                ...createdTask,
                attachment: uploadedDoc.url || `/api/uploads/${uploadedDoc.stored_name}`,
                attachmentName: uploadedDoc.original_name || attachment.name,
                mimeType: uploadedDoc.mime_type || attachment.type
            }
        }

        return createdTask
    },

    async updateTaskStatus(taskId, status) {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status }),
            credentials: 'include'
        })
        return checkResponse(response)
    },

    async updateTask(taskId, data) {
        let attachment = null

        if (data.attachment && data.attachment instanceof File) {
            attachment = data.attachment
            delete data.attachment
            delete data.attachmentName
        } else {
            delete data.attachment
            delete data.attachmentName
        }

        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
        const updatedTask = await checkResponse(response)

        if (attachment) {
            const formData = new FormData()
            formData.append('document', attachment)
            const uploadResponse = await fetch(`/api/tasks/${updatedTask.id}/document`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            })
            const uploadedDoc = await checkResponse(uploadResponse)
            return {
                ...updatedTask,
                attachment: uploadedDoc.url || `/api/uploads/${uploadedDoc.stored_name}`,
                attachmentName: uploadedDoc.original_name || attachment.name,
                mimeType: uploadedDoc.mime_type || attachment.type
            }
        }

        return updatedTask
    },

    async deleteTask(taskId) {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        return checkResponse(response)
    }
}