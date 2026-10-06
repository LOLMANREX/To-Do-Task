# 🎯 To-Do Task — Fullstack SaaS Productivity Suite

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL_8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

> Application web moderne de gestion de tâches et de productivité personnelle au design **SaaS brutal-minimaliste**, entièrement conteneurisée sous Docker avec persistance MySQL et Reverse Proxy Nginx.

---

## 🌟 Points Forts & Fonctionnalités

### 📊 1. Tableau de bord & Statistiques en temps réel
- **Salutation personnalisée** : Affichage dynamique de l'avatar et du pseudo utilisateur.
- **Indicateurs clés** : Nombre total de tâches, tâches en cours et tâches terminées.
- **Barre de progression** : Calcul en temps réel du taux de complétion avec animation fluide de la jauge.

### 📝 2. Gestion Avancée des Tâches (CRUD)
- **Création complète** : Nom, description détaillée, date d'échéance et heure limite.
- **Niveaux de priorité & Statuts** : Organisation par états (*À faire*, *En cours*, *Terminée*).
- **Filtres instantanés** : Tri dynamique des tâches selon leur état d'avancement.
- **Détection des retards** : Mise en évidence visuelle des tâches en retard par rapport à la date du jour.

### 📎 3. Documents & Pièces Jointes
- **Upload persistant** : Prise en charge des pièces jointes jusqu'à **5 Mo** par tâche via Multer (images, PDF, documents).
- **Stockage dédié & base de données** : Conservation des fichiers sur le volume Docker interne sécurisé `/app/uploads` et liaison SQL avec nom d'origine et type MIME.
- **Consultation & Téléchargement** : Visualisation directe en un clic (miniature d'image interactive ou ouverture plein écran dans un nouvel onglet) et bouton de téléchargement dédié.
- **Nettoyage automatique** : Suppression physique des fichiers du disque lors de la suppression de la tâche associée.

### 📅 4. Agenda & Calendrier Interactif
- **Vue mensuelle ergonomique** : Navigation d'un mois à l'autre avec mise en surbrillance de la date actuelle.
- **Affichage contextuel** : Les tâches planifiées apparaissent directement dans leur case journalière avec leur statut.
- **Planification rapide** : Ouverture d'une fenêtre de création/édition pré-remplie en cliquant sur n'importe quel jour du calendrier.

### 👤 5. Profil Utilisateur & Système d'Avatars
- **Pseudo persistant** : Affichage continu du pseudo dans la barre latérale, le header mobile et le dashboard, avec repli intelligent sur l'email si aucun prénom n'est configuré.
- **Galerie d'avatars par défaut** : 4 presets vectoriels SVG intégrés (*Minimaliste*, *Émeraude*, *Indigo*, *Ambre*) sans dépendance réseau externe.
- **Photo personnalisée** : Téléversement de sa propre image de profil (JPG, PNG, WEBP, GIF jusqu'à 5 Mo).
- **Réinitialisation en un clic** : Retour instantané à l'avatar par défaut.

### 🎨 6. Galerie de Thèmes Exclusifs & Système Apple Liquid Glass
- **4 Thèmes Distincts Intégrés** :
  - ☀️ **Minimaliste Clair** : Design brutal-minimaliste épuré avec contrastes nets et fond immaculé.
  - 🌙 **Minimaliste Sombre** : Noir profond et ergonomie nocturne réduisant la fatigue visuelle.
  - 💧 **Apple Liquid Glass Clair** : Fidèle réplique du verre optique Apple (macOS Sonoma / visionOS Light) avec biseau spéculaire 1px (`inset 0 1px 1px rgba(255,255,255,0.95)`), réfraction chromatique et 4 orbes fluides en dérive orbitale animée.
  - 🌌 **Apple Liquid Glass Sombre** : Édition obsidienne spatiale (visionOS Space Obsidian / macOS Midnight) avec plasma bioluminescent cosmique (indigo, pourpre, cyan) et arêtes ciselées réfléchissantes.
- **Moteur de Réfraction & Verre Optique Apple** : Filtres optiques avancés (`backdrop-filter: blur(40px) saturate(200%)`), typographie SF Pro lissée, boutons d'action bleu Apple glossy et défilement macOS ultra-fin.
- **Animations Cinématiques** : Exploitation de l'API moderne `document.startViewTransition` couplée à des transitions CSS fluides (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Sélecteur Segmenté Direct** : Contrôle 4-en-1 accessible dans la barre latérale pour basculer en un clic et galerie visuelle détaillée dans les Paramètres.

### 📱 7. Simulateur Multi-Device
- **Mode Bureau** : Barre latérale rétractable avec navigation complète et profil utilisateur en pied de page.
- **Mode Mobile** : Mockup réaliste de smartphone avec Dynamic Island et barre de navigation tactile flottante, idéal pour les démonstrations et l'utilisation sur petits écrans.

### 🔒 8. Sécurité & Authentification
- **Chiffrement** : Hashage des mots de passe avec **Bcrypt** (salage à 10 tours).
- **Session sécurisée** : Jetons **JWT** transmis via des cookies `httpOnly`, protégeant l'application contre les attaques XSS.
- **Routes protégées** : Middleware d'authentification vérifiant le jeton à chaque requête API.

### 💾 9. Portabilité & Sauvegarde
- **Export JSON** : Sauvegarde en 1 clic de l'intégralité du compte utilisateur et de ses tâches sous format JSON structuré.

---

## 🏛️ Architecture Technique & Infrastructure

L'application repose sur une architecture en micro-services conteneurisée et orchestrée via **Docker Compose** sur un réseau interne isolé :

```text
[ Client Web (Navigateur) ]
           │
           ▼ (Port 80)
   [ Nginx Reverse Proxy ]
     ├── /api/*   ─────────►  [ Backend Express:3000 ]  ◄──►  [ Volume Uploads ]
     │                                │
     │                                ▼
     │                        [ MySQL 8.4:3306 ]        ◄──►  [ Volume DB Data ]
     │                                ▲
     │                                │
     └── /*       ─────────►  [ Frontend Vite:5173 ]
                                      │
[ Navigateur Dev (Port 8080) ] ───────┴────────► [ phpMyAdmin ]
```

### Services Docker

| Service | Image / Build | Port Externe | Rôle |
| :--- | :--- | :--- | :--- |
| **`nginx`** | `nginx:alpine` | `80` | Reverse proxy : achemine `/api` vers Express et le reste vers Vite |
| **`frontend`** | `node:alpine` | *Interne (5173)* | Application React 19 / Vite avec HMR |
| **`backend`** | `node:alpine` | *Interne (3000)* | API REST Express, authentification JWT et gestion de fichiers |
| **`db`** | `mysql:8.4` | *Interne (3306)* | Base de données relationnelle MySQL avec healthcheck actif |
| **`phpmyadmin`** | `phpmyadmin` | `8080` | Interface web d'administration de la base de données |

---

## 📁 Structure du Projet

```text
To-Do-Task/
├── docker-compose.yml       # Configuration de l'orchestration des 5 conteneurs
├── .env.example             # Modèle des variables d'environnement
├── README.md                # Documentation principale du projet
├── nginx/
│   └── default.conf         # Configuration du Reverse Proxy Nginx
├── db/
│   └── init/
│       └── 01-schema.sql    # Script d'initialisation de la base de données
├── backend/
│   ├── Dockerfile           # Image Docker Node Alpine pour l'API
│   ├── package.json         # Dépendances (Express, MySQL2, JWT, Bcrypt, Multer)
│   ├── uploads/             # Dossier de stockage des pièces jointes et avatars
│   └── src/
│       ├── index.js         # Point d'entrée du serveur Express
│       ├── config/          # Connexion pool MySQL
│       ├── controllers/     # Contrôleurs métier (Auth, Tâches)
│       ├── middlewares/     # Vérification JWT et permissions
│       └── routes/          # Définition des routes de l'API REST
└── frontend/
    ├── Dockerfile           # Image Docker Node Alpine pour Vite
    ├── package.json         # Dépendances (React, Tailwind v4, Lucide Icons)
    ├── vite.config.js       # Configuration Vite
    └── src/
        ├── components/      # Composants UI et Avatar réutilisables
        ├── contexts/        # Contextes React (Auth, Thème, ViewMode)
        ├── layouts/         # Layout principal Dashboard (PC & Mobile)
        ├── Page/            # Vues (Accueil, Tâches, Agenda, Paramètres, Auth)
        └── services/        # Clients d'appel HTTP vers l'API Backend
```

---

## 🚀 Démarrage Rapide

### Prérequis
- [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/) installés sur votre machine.

### Installation

1. **Cloner le projet** :
   ```bash
   git clone https://github.com/LOLMANREX/To-Do-Task.git
   cd To-Do-Task
   ```

2. **Créer le fichier d'environnement** :
   ```bash
   cp .env.example .env
   ```
   *(Vous pouvez personnaliser les mots de passe et la clé secrète JWT si nécessaire)*

3. **Lancer les conteneurs** :
   ```bash
   docker compose up --build
   ```

4. **Accéder à l'application** :
   - 🖥️ **Application Web** : [http://localhost](http://localhost)
   - ⚙️ **phpMyAdmin** : [http://localhost:8080](http://localhost:8080)
   - 🔌 **API REST** : [http://localhost/api](http://localhost/api)

---

## 📡 Documentation de l'API REST

### Authentification (`/api/auth`)
- `POST /api/auth/register` : Création de compte avec mot de passe hashé et initialisation du cookie JWT.
- `POST /api/auth/login` : Connexion utilisateur et émission du cookie JWT `httpOnly`.
- `GET /api/auth/me` : Récupération des données du profil de l'utilisateur connecté.
- `PUT /api/auth/profile` : Mise à jour du prénom/pseudo et du nom.
- `POST /api/auth/avatar` : Téléversement d'une nouvelle photo de profil (Multer).
- `PUT /api/auth/avatar-preset` : Définition d'un avatar vectoriel prédéfini.
- `DELETE /api/auth/avatar` : Suppression de la photo personnalisée et retour à l'avatar par défaut.

### Tâches (`/api/tasks`)
- `GET /api/tasks` : Liste de toutes les tâches de l'utilisateur connecté.
- `POST /api/tasks` : Création d'une nouvelle tâche.
- `PUT /api/tasks/:id` / `PATCH /api/tasks/:id` : Mise à jour complète ou partielle d'une tâche (nom, statut, dates).
- `DELETE /api/tasks/:id` : Suppression d'une tâche (cascade SQL et suppression physique des documents liés sur le disque).
- `POST /api/tasks/:id/document` : Téléversement d'une pièce jointe (stockage persistant `/app/uploads`).

---

## 📄 Licence

Ce projet est distribué sous licence open-source. Développé avec passion pour allier performance, simplicité et design épuré.
