# 🪟 To-Do Task — Édition Windows Desktop Native (.EXE)

Application de gestion de tâches et de productivité conçue pour **Windows** sous la forme d'un exécutable natif autonome avec **Electron** et **SQLite 3**.

---

## 🌟 Caractéristiques

- **100% Autonome** : Aucune dépendance externe ni Docker requis.
- **Base de données SQLite** : Données stockées localement dans `database.sqlite`.
- **Design Apple Liquid Glass** : Thèmes Dark/Light avec effets visuels avancés.
- **Packaging Windows** : Création d'installeur `.exe` (NSIS) via Electron Builder.

---

## 🚀 Démarrage & Utilisation

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- `npm`

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

## 📦 Compilation & Création du fichier `.EXE`

Pour générer l'installateur Windows (`.exe`) :
```bash
npm run dist
```
L'exécutable d'installation NSIS sera généré dans le répertoire `dist/`.

Pour recompiler le frontend React si vous apportez des modifications au code source dans `frontend/` :
```bash
cd frontend
npm install
npm run build
cd ..
```
