# 🎯 To-Do Task — Suite Multi-Plateforme (Web, Windows, Linux)

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL_8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> Suite complète de gestion de tâches et de productivité déclinée en **3 éditions dédiées** : une version **Web SaaS conteneurisée**, une version **Desktop Windows native (.EXE)** et une version **Desktop Linux native**. Conçue avec le design d'exception **Apple Liquid Glass** (visionOS / macOS), un système complet d'agenda, la gestion de pièces jointes et un profil utilisateur personnalisable.

---

## 📂 Organisation du Répertoire (3 Éditions)

Le projet est structuré en 3 dossiers autonomes selon vos besoins d'utilisation et de déploiement :

| Dossier | Plateforme cible | Moteur de données | Packaging / Exécution |
| :--- | :--- | :--- | :--- |
| **[`To-Do web/`](./To-Do%20web)** | Web / Cloud SaaS | MySQL 8.4 (Docker) | Docker Compose (Nginx + Frontend + Backend + DB + phpMyAdmin) |
| **[`TO-Do Win/`](./TO-Do%20Win)** | Windows Desktop | SQLite local autonome | Application Electron native & installeur `.exe` (NSIS) |
| **[`To-Do linux/`](./To-Do%20linux)** | Linux Desktop | SQLite local autonome | Application Electron native & paquets `.AppImage` / `.deb` |

---

## 🌟 Fonctionnalités Communes

- **🎨 Design Apple Liquid Glass & Thèmes Exclusifs** :
  - ☀️ **Minimaliste Clair** & 🌙 **Minimaliste Sombre** : design épuré, contrastes soignés.
  - 💧 **Apple Liquid Glass Clair** : verre optique ultra-réaliste façon macOS Sonoma / visionOS Light (`backdrop-filter: blur(40px)`), biseau spéculaire 1px et 4 orbes fluides en dérive orbitale animée.
  - 🌌 **Apple Liquid Glass Sombre** : édition Space Obsidian avec plasma bioluminescent cosmique et contours ciselés réfléchissants.
  - Transitions d'écran cinématiques via `document.startViewTransition`.
- **📝 Gestion Complète des Tâches (CRUD)** :
  - Organisation par états : *À faire*, *En cours*, *Terminée*.
  - Définition d'échéances avec date et heure limite, alertes de retard visuelles.
  - Filtres instantanés et barre de progression dynamique.
- **📎 Pièces Jointes & Documents Persistants** :
  - Téléversement direct de fichiers (images, PDF, documents) jusqu'à 5 Mo.
  - Consultation en un clic, visualiseur d'images intégré et téléchargement direct.
  - Stockage persistant et nettoyage automatique sur suppression.
- **📅 Agenda & Calendrier Interactif** :
  - Vue mensuelle ergonomique avec repérage des tâches par jour et création rapide.
- **👤 Profil Utilisateur & Avatars** :
  - 4 presets vectoriels SVG exclusifs sans dépendance externe.
  - Téléversement d'avatar photo personnalisé ou réinitialisation en 1 clic.
  - Exportation intégrale des données utilisateur au format JSON.

---

## 🚀 Guides de Lancement Rapide

### 1. 🌐 Version Web (`To-Do web/`)

Idéale pour un hébergement en ligne ou un usage multi-utilisateurs avec Docker.

```bash
cd "To-Do web"

# 1. Copier le fichier d'environnement
cp .env.example .env

# 2. Lancer la pile complète avec Docker Compose
docker compose up --build
```

- **Application Web** : [http://localhost](http://localhost) (via Nginx sur le port 80)
- **phpMyAdmin** : [http://localhost:8080](http://localhost:8080)
- **API REST** : [http://localhost/api](http://localhost/api)

Pour arrêter les conteneurs :
```bash
docker compose down
```

---

### 2. 🪟 Version Windows Native (`TO-Do Win/`)

Version de bureau 100% autonome **sans Docker** : elle embarque son propre serveur local et une base de données **SQLite** persistée dans un fichier local `database.sqlite`.

#### Lancement en mode local / développement :
```bash
cd "TO-Do Win"

# Installer les dépendances
npm install

# Démarrer l'application Electron
npm start
```

#### Compilation & Génération du fichier `.EXE` :
```bash
npm run dist
```
L'installeur exécutable Windows (`.exe` NSIS) sera généré dans le sous-dossier `dist/`.

> 💡 **Astuce de build Windows** : Les outils de compilation natifs Node (`node-gyp`) nécessitent que le chemin d'accès ne contienne pas d'espaces pour compiler les modules binaires (`sqlite3`, `bcrypt`). Si vous compilez depuis un terminal, veillez à utiliser un chemin sans espace ou compilez directement sous votre environnement Windows cible.

---

### 3. 🐧 Version Linux Native (`To-Do linux/`)

Version de bureau pour les distributions Linux (Ubuntu, Debian, Fedora, Arch, etc.), également 100% autonome grâce à la base locale **SQLite**.

#### Lancement en mode local / développement :
```bash
cd "To-Do linux"

# Installer les dépendances
npm install

# Démarrer l'application Electron
npm start
```

#### Compilation & Génération des paquets Linux (`.AppImage` / `.deb`) :
```bash
npm run dist
```
Les fichiers binaires exécutables (`.AppImage` et `.deb`) seront générés dans le dossier `dist/`.

> 💡 **Prérequis pour le packaging Linux** : Assurez-vous d'avoir les outils de compilation de base installés sur votre système (ex. sur Debian/Ubuntu : `sudo apt update && sudo apt install build-essential`).

---

## 🏛️ Architecture & Comparatif Technique

```text
[ To-Do Task Monorepo ]
 ├── To-Do web/   ──► Docker Compose ──► Nginx :80 ──► React 19 (Vite)
 │                                       ├── /api  ──► Node.js Express (MySQL 8.4)
 │                                       └── :8080 ──► phpMyAdmin
 │
 ├── TO-Do Win/   ──► Electron Native ─► Fenêtre Desktop (React 19)
 │                                       └── Backend Express local + SQLite autonome (.EXE)
 │
 └── To-Do linux/ ──► Electron Native ─► Fenêtre Desktop (React 19)
                                         └── Backend Express local + SQLite autonome (.AppImage / .deb)
```

| Composant | Édition Web (`To-Do web`) | Éditions Desktop (`TO-Do Win` / `To-Do linux`) |
| :--- | :--- | :--- |
| **Interface UI** | React 19 + Tailwind v4 + Lucide | React 19 + Tailwind v4 (embarqué dans Electron) |
| **Serveur Backend** | Node.js Express sous conteneur | Node.js Express géré dynamiquement par Electron |
| **Base de Données** | MySQL 8.4 conteneurisé | SQLite 3 (base locale sans configuration) |
| **Reverse Proxy** | Nginx Reverse Proxy (Port 80) | Communication directe IPC / HTTP local sécurisé |
| **Dépendance Docker** | Oui (recommandé pour l'orchestration) | **Non** (100% autonome et hors-ligne) |

---

## 📄 Licence

Ce projet est distribué sous licence open-source. Développé pour allier performance native, design Apple raffiné et flexibilité multi-plateforme.
