# 🪟 To-Do Task — Édition Windows Desktop Native (.EXE)

Application de gestion de tâches et de productivité conçue pour **Windows** sous la forme d'un exécutable natif autonome avec **Electron** et **SQLite 3**.

---

## 🌟 Caractéristiques

- **100% Autonome** : Aucune dépendance externe ni Docker requis.
- **Base de données SQLite** : Données stockées localement dans `database.sqlite`.
- **Éditeur de documents Markdown persistant** : Sauvegarde automatique instantanée en base SQLite + cache local (zéro perte de données en cas de reboot ou crash), rédaction plein écran, barre d'outils complète et export MD/TXT/PDF.
- **Barre latérale rétractable (Style Gemini)** : Réduction de la navigation principale en un rail compact d'icônes avec persistance de l'état.
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

---

## 🤖 Compilation Automatique via GitHub Actions CI/CD

Un workflow GitHub Actions (`.github/workflows/build-windows.yml`) est configuré pour compiler automatiquement l'installateur `.exe` Windows sans avoir besoin de machine Windows locale :

1. **À chaque mise à jour** : Déclenché automatiquement lors d'un `git push` sur `main` qui modifie `TO-Do Win/`.
2. **À la demande (manuel)** : Rendez-vous sur GitHub dans l'onglet **Actions** > **Build Windows App (.EXE)** > cliquez sur **Run workflow**.
3. **Téléchargement direct (Artifacts)** : Cliquez sur le run terminé, puis téléchargez le fichier dans la section **Artifacts** (`To-Do-Task-Windows-Setup`).
4. **Publication automatique** : Dès qu'un tag `v*` est créé ou lors d'une release GitHub, le setup `.exe` est directement publié dans les assets de la release.

