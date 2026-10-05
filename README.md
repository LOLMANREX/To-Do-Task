# To-Do Task

Application SaaS To-Do List brutal-minimaliste transformée en architecture fullstack conteneurisée.

## Stack Technique
- **Frontend** : React 19, Vite, Tailwind CSS v4, Lucide Icons
- **Backend** : Node.js, Express, MySQL2, JWT (cookies httpOnly), Multer, Bcrypt
- **Base de données** : MySQL 8.4 avec persistance sur volume Docker
- **Reverse Proxy** : Nginx (port 80)
- **Administration DB** : phpMyAdmin (port 8080)
- **Orchestration** : Docker Compose

## Démarrage Rapide

1. Cloner le dépôt :
```bash
git clone https://github.com/LOLMANREX/To-Do-Task.git
cd To-Do-Task
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

3. Lancer l'ensemble des conteneurs :
```bash
docker compose up --build
```

L'application sera accessible sur :
- **Application Web** : http://localhost
- **API Backend** : http://localhost/api
- **phpMyAdmin** : http://localhost:8080

## Fonctionnalités
- Authentification sécurisée par JWT dans cookie httpOnly (Inscription, Connexion, Session)
- Gestion complète des tâches (création, mise à jour, suppression, filtrage, dates d'échéance)
- Téléversement de pièces jointes (documents jusqu'à 5 Mo)
- Système de photo de profil avec galerie d'avatars par défaut et upload personnalisé
- Animation fluide du changement de thème (Clair / Sombre) via View Transitions
- Mode d'affichage adaptatif (Bureau et Mobile)
