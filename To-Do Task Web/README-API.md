# 📡 API REST - To-Do Task Web

## 🏗️ Architecture

```
Nginx (:80) ──► Express Backend (port 3000)
                          │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
    /api/auth          /api/tasks         /api/notes
     └────────────────────────────────────────┘
                          │
                    MySQL 8.4
                    (Docker)
```

### 📍 Endpoints

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `/api/auth/register` | POST | Non | S'inscrire |
| `/api/auth/login` | POST | Non | Se connecter |
| `/api/auth/me` | GET | Oui | Infos utilisateur |
| `/api/auth/profile` | PUT | Oui | Mettre à jour le profil |
| `/api/auth/avatar` | POST | Oui | Upload avatar |
| `/api/auth/avatar` | DELETE | Oui | Supprimer avatar |
| `/api/auth/avatar-preset` | PUT | Oui | Changer avatar par preset |
| `/api/tasks/` | GET | Oui | Liste des tâches |
| `/api/tasks/` | POST | Oui | Créer une tâche |
| `/api/tasks/:id` | PUT/DELETE | Oui | Modifier/supprimer tâche |
| `/api/tasks/:id/document` | POST | Oui | Uploader un document |
| `/api/notes/` | GET | Oui | Liste des notes |
| `/api/notes/:id` | GET | Oui | Récupérer une note |
| `/api/notes/` | POST | Oui | Créer une note |
| `/api/notes/:id` | PUT/DELETE | Oui | Modifier/supprimer note |

---

## 🔐 Authentification

### Base de données

**Schéma MySQL :**
```sql
users (id, email, password_hash, first_name, last_name, avatar_url)
tasks (id, user_id, name, description, status, due_date, due_time)
documents (id, task_id, stored_name, original_name, mime_type)
notes (id, user_id, title, content, pinned, created_at, updated_at)
```

### JWT & Cookies

- Token JWT envoyé dans un cookie `httpOnly`
- Durée : 24 heures
- Méthode : HMAC SHA25
- Les routes protégées nécessitent le cookie `jwt`

---

## 📋 Documentation des endpoints

### 1. 🔑 Authentification

#### `POST /api/auth/register`

**Description** : Créer un nouveau compte utilisateur.

**Body** (JSON) :
```json
{
  "email": "utilisateur@example.com",
  "password": "motDePasse123",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

**Réponse** (201 Created) :
```json
{
  "id": 1,
  "email": "utilisateur@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "avatarUrl": null
}
```

---

#### `POST /api/auth/login`

**Description** : Se connecter avec un compte existant.

**Body** (JSON) :
```json
{
  "email": "utilisateur@example.com",
  "password": "motDePasse123"
}
```

**Réponse** (200 OK) :
```json
{
  "id": 1,
  "email": "utilisateur@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "avatarUrl": null
}
```

---

#### `GET /api/auth/me`

**Description** : Récupérer les informations de l'utilisateur connecté.

**Réponse** (200 OK) :
```json
{
  "id": 1,
  "email": "utilisateur@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "avatarUrl": "/api/uploads/avatar-1234567890-1234567890.jpg"
}
```

---

#### `PUT /api/auth/profile`

**Description** : Mettre à jour le profil (prénom, nom).

**Body** (JSON) :
```json
{
  "firstName": "Jeanne",
  "lastName": "Dupont"
}
```

**Réponse** (200 OK) :
```json
{
  "id": 1,
  "email": "utilisateur@example.com",
  "firstName": "Jeanne",
  "lastName": "Dupont",
  "avatarUrl": null
}
```

---

#### `POST /api/auth/avatar`

**Description** : Upload d'un avatar personnalisé.

**Paramètres** :
- Fichier multipart `avatar` (max 5 Mo)
- Formats : JPG, PNG, GIF, WEBP

**Réponse** (200 OK) :
```json
{
  "id": 1,
  "email": "utilisateur@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "avatarUrl": "/api/uploads/avatar-1234567890-1234567890.jpg"
}
```

---

#### `DELETE /api/auth/avatar`

**Description** : Supprimer l'avatar.

**Réponse** (200 OK) :
```json
{
  "id": 1,
  "email": "utilisateur@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "avatarUrl": null
}
```

---

#### `PUT /api/auth/avatar-preset`

**Description** : Changer d'avatar avec un preset vectoriel.

**Body** (JSON) :
```json
{
  "avatarUrl": "/api/uploads/presets/avatar-1.svg"
}
```

**Réponse** (200 OK) :
```json
{
  "id": 1,
  "email": "utilisateur@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "avatarUrl": "/api/uploads/presets/avatar-1.svg"
}
```

---

### 2. ✅ Gestion des Tâches (`/api/tasks`)

#### `GET /api/tasks`

**Description** : Récupérer toutes les tâches de l'utilisateur.

**Réponse** (200 OK) :
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Ma première tâche",
    "description": "Description de la tâche",
    "status": "todo",
    "due_date": "2026-10-22T00:00:00.000Z",
    "due_time": null,
    "document_id": null,
    "stored_name": null,
    "original_name": null,
    "mime_type": null,
    "dueDate": "2026-10-22T00:00:00.000Z",
    "dueTime": null,
    "attachment": null,
    "attachmentName": null,
    "mimeType": null
  }
]
```

---

#### `POST /api/tasks`

**Description** : Créer une nouvelle tâche.

**Body** (JSON) :
```json
{
  "name": "Nouvelle tâche",
  "description": "Description optionnelle",
  "status": "todo",
  "dueDate": "2026-10-22T00:00:00.000Z",
  "dueTime": "14:30:00"
}
```

**Réponse** (201 Created) :
```json
{
  "id": 2,
  "user_id": 1,
  "name": "Nouvelle tâche",
  "description": "Description optionnelle",
  "status": "todo",
  "due_date": "2026-10-22T00:00:00.000Z",
  "due_time": "14:30:00",
  "document_id": null,
  "stored_name": null,
  "original_name": null,
  "mime_type": null,
  "dueDate": "2026-10-22T00:00:00.000Z",
  "dueTime": "14:30:00",
  "attachment": null,
  "attachmentName": null,
  "mimeType": null
}
```

---

#### `PUT /api/tasks/:id`

**Description** : Mettre à jour une tâche.

**Body** (JSON) :
```json
{
  "name": "Nouvelle tâche",
  "description": "Nouvelle description",
  "status": "done",
  "dueDate": "2026-10-22T00:00:00.000Z"
}
```

**Réponse** (200 OK) :
```json
{
  "id": 2,
  "user_id": 1,
  "name": "Nouvelle tâche",
  "description": "Nouvelle description",
  "status": "done",
  ...
}
```

---

#### `DELETE /api/tasks/:id`

**Description** : Supprimer une tâche (nettoyage automatique des fichiers joints).

**Réponse** (200 OK) :
```json
{
  "message": "Task deleted"
}
```

---

#### `POST /api/tasks/:id/document`

**Description** : Uploader un document joint à une tâche.

**Paramètres** :
- Fichier multipart `document` (max 5 Mo)
- Formats : JPG, PNG, GIF, WEBP, PDF, DOCX, etc.

**Réponse** (201 Created) :
```json
{
  "message": "File uploaded successfully",
  "stored_name": "document-1234567890-1234567890.pdf",
  "original_name": "mon-document.pdf",
  "mime_type": "application/pdf",
  "url": "/api/uploads/document-1234567890-1234567890.pdf",
  "attachment": "/api/uploads/document-1234567890-1234567890.pdf",
  "attachmentName": "mon-document.pdf",
  "mimeType": "application/pdf"
}
```

---

### 3. 📝 Gestion des Notes/Documents (`/api/notes`)

#### `GET /api/notes`

**Description** : Récupérer toutes les notes de l'utilisateur.

**Réponse** (200 OK) :
```json
[
  {
    "id": 1,
    "userId": 1,
    "title": "Ma note",
    "content": "Contenu de la note...",
    "pinned": true,
    "createdAt": "2026-10-09T10:00:00.000Z",
    "updatedAt": "2026-10-09T10:05:00.000Z"
  }
]
```

---

#### `GET /api/notes/:id`

**Description** : Récupérer une note spécifique.

**Réponse** (200 OK) :
```json
{
  "id": 1,
  "userId": 1,
  "title": "Ma note",
  "content": "Contenu de la note...",
  "pinned": true,
  "createdAt": "2026-10-09T10:00:00.000Z",
  "updatedAt": "2026-10-09T10:05:00.000Z"
}
```

---

#### `POST /api/notes`

**Description** : Créer une nouvelle note.

**Body** (JSON) :
```json
{
  "title": "Nouvelle note",
  "content": "Contenu de la note",
  "pinned": false
}
```

**Réponse** (201 Created) :
```json
{
  "id": 2,
  "userId": 1,
  "title": "Nouvelle note",
  "content": "Contenu de la note",
  "pinned": false,
  "createdAt": "2026-10-09T10:00:00.000Z",
  "updatedAt": "2026-10-09T10:00:00.000Z"
}
```

---

#### `PUT /api/notes/:id`

**Description** : Mettre à jour une note.

**Body** (JSON) :
```json
{
  "title": "Nouvelle note",
  "content": "Nouveau contenu",
  "pinned": true
}
```

**Réponse** (200 OK) :
```json
{
  "id": 2,
  "userId": 1,
  "title": "Nouvelle note",
  "content": "Nouveau contenu",
  "pinned": true,
  "createdAt": "2026-10-09T10:00:00.000Z",
  "updatedAt": "2026-10-09T10:05:00.000Z"
}
```

---

#### `DELETE /api/notes/:id`

**Description** : Supprimer une note.

**Réponse** (200 OK) :
```json
{
  "message": "Document supprimé avec succès"
}
```

---

## 🔧 Configuration

### Variables d'environnement (.env)

```env
PORT=3000
DB_HOST=localhost
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=your-secret-key
NODE_ENV=development
UPLOADS_PATH=/app/uploads
```

### Ports

- **Application Web** : `http://localhost` (port 80 via Nginx)
- **API REST** : `http://localhost/api`
- **phpMyAdmin** : `http://localhost:8080`

### Limite de fichiers uploadés

- **Taille max** : 5 Mo par fichier
- **Formats supportés** : JPG, PNG, GIF, WEBP, PDF, DOCX, TXT, MD

---

## 📊 Statut des tâches

| Valeur | Description |
|--------|-------------|
| `todo` | À faire |
| `in-progress` | En cours |
| `done` | Terminée |

---

## 🚀 Tests rapides avec curl

```bash
# Inscription
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Jean","lastName":"Dupont"}' -c cookies.txt

# Connexion
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' -b cookies.txt

# Récupérer les tâches
curl -X GET http://localhost/api/tasks -b cookies.txt
```

---

## 📝 Notes

- Toutes les routes protégées nécessitent le cookie `jwt`
- Les cookies sont automatiquement gérés par Express
- La sécurité HTTP est activée en production (`NODE_ENV=production`)
- Les fichiers uploadés sont stockés dans `/app/uploads`
- Suppression automatique des fichiers lors de la suppression des tâches/note
