const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let serverInstance;

Menu.setApplicationMenu(null);

async function startBackendServer(defaultPort = 3000) {
    const isPackaged = app.isPackaged;
    const userDataPath = app.getPath('userData');

    const uploadsPath = isPackaged
        ? path.join(userDataPath, 'uploads')
        : path.join(__dirname, 'uploads');
    const dbPath = isPackaged
        ? path.join(userDataPath, 'database.sqlite')
        : path.join(__dirname, 'database.sqlite');

    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
    }
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    process.env.UPLOADS_PATH = uploadsPath;
    process.env.DB_PATH = dbPath;
    process.env.NODE_ENV = 'production';
    if (!process.env.JWT_SECRET) {
        process.env.JWT_SECRET = 'todo_desktop_jwt_secret_fallback_key_2026';
    }

    let backendModulePath = path.join(__dirname, 'backend', 'src', 'index.js');
    if (isPackaged && !fs.existsSync(backendModulePath)) {
        backendModulePath = backendModulePath.replace('app.asar', 'app.asar.unpacked');
    }

    const { startServer } = require(backendModulePath);

    // Essai sur le port par défaut (3000), puis fallback sur 3001 si déjà utilisé
    try {
        process.env.PORT = String(defaultPort);
        serverInstance = await startServer(defaultPort);
        return defaultPort;
    } catch (err) {
        if (err.code === 'EADDRINUSE') {
            const fallbackPort = defaultPort + 1;
            console.warn(`Port ${defaultPort} occupé, tentative sur le port ${fallbackPort}...`);
            process.env.PORT = String(fallbackPort);
            serverInstance = await startServer(fallbackPort);
            return fallbackPort;
        }
        throw err;
    }
}

async function createWindow() {
    mainWindow = new BrowserWindow({
        title: 'To-Do Task Win',
        icon: path.join(__dirname, 'build', 'icon.ico'),
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
        },
    });

    try {
        const port = await startBackendServer(3000);
        await mainWindow.loadURL(`http://localhost:${port}`);
    } catch (err) {
        console.error('Erreur au lancement du serveur local:', err);
        const errorHtmlPath = path.join(__dirname, 'error.html');
        if (fs.existsSync(errorHtmlPath)) {
            mainWindow.loadFile(errorHtmlPath);
        }
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
    if (serverInstance && typeof serverInstance.close === 'function') {
        serverInstance.close();
    }
});
