# 🐧 To-Do Task — Édition Linux Desktop Native (.AppImage / .deb)

Application de gestion de tâches et de productivité conçue pour **Linux** (Ubuntu, Debian, Fedora, Arch, etc.) sous la forme d'un paquet autonome avec **Electron** et **SQLite 3**.

---

## 🌟 Caractéristiques

- **100% Autonome** : Aucune dépendance externe ni Docker requis.
- **Base de données SQLite** : Données stockées localement dans `database.sqlite`.
- **Éditeur de documents Markdown persistant** : Sauvegarde automatique instantanée en base SQLite + cache local (zéro perte de données en cas de reboot ou crash), rédaction plein écran, barre d'outils complète et export MD/TXT/PDF.
- **Barre latérale rétractable (Style Gemini)** : Réduction de la navigation principale en un rail compact d'icônes avec persistance de l'état.
- **Design Apple Liquid Glass** : Thèmes Dark/Light avec effets visuels avancés.
- **Packaging Linux** : Génération de paquets `.AppImage` et `.deb` via Electron Builder.

---

## 🚀 Démarrage & Utilisation

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- `npm`
- Outils de compilation essentiels (`build-essential` sous Debian/Ubuntu)

### 1. Installation des dépendances
```bash
npm install
```

### 2. Démarrage de l'application
```bash
npm start
```
Cette commande démarre le serveur backend local Express et ouvre la fenêtre native Electron.

---

## 📦 Compilation & Création des paquets Linux

Pour générer les paquets Linux (`.AppImage` et `.deb`) :
```bash
npm run dist
```
Les fichiers binaires exécutables seront générés dans le dossier `dist/`.

Pour recompiler le frontend React si vous apportez des modifications au code source dans `frontend/` :
```bash
cd frontend
npm install
npm run build
cd ..
```
