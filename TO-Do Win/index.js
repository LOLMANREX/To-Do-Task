const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');

let mainWindow;
let backendProcess;

async function createWindow() {
    mainWindow = new BrowserWindow({
        title: 'To-Do Task Win',
        icon: path.join(__dirname, 'build', 'icon.ico'),
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Start the backend server on a fixed port (e.g. 5005)
    const port = 5005;
    const isPackaged = app.isPackaged;

    let backendPath = path.join(__dirname, 'backend', 'src', 'index.js');
    if (isPackaged) {
        backendPath = backendPath.replace('app.asar', 'app.asar.unpacked');
    }

    const userDataPath = app.getPath('userData');
    const uploadsPath = isPackaged ? path.join(userDataPath, 'uploads') : path.join(__dirname, 'uploads');
    const dbPath = isPackaged ? path.join(userDataPath, 'database.sqlite') : path.join(__dirname, 'database.sqlite');

    const nodeExecutable = isPackaged ? process.execPath : 'node';
    const env = {
        ...process.env,
        PORT: port,
        NODE_ENV: 'production',
        UPLOADS_PATH: uploadsPath,
        DB_PATH: dbPath,
        ...(isPackaged ? { ELECTRON_RUN_AS_NODE: '1' } : {})
    };

    backendProcess = spawn(nodeExecutable, [backendPath], {
        env,
        stdio: 'inherit'
    });

    try {
        await waitOn({ resources: [`http-get://localhost:${port}/api/auth/me`], timeout: 30000, validateStatus: () => true });
        mainWindow.loadURL(`http://localhost:${port}`);
    } catch (err) {
        console.error('Backend failed to start', err);
        mainWindow.loadFile(path.join(__dirname, 'error.html'));
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
    if (backendProcess) {
        backendProcess.kill();
    }
});
