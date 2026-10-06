const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');

let mainWindow;
let backendProcess;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Start the backend server on a fixed port (e.g. 5005)
    const port = 5005;
    const backendPath = path.join(__dirname, 'backend', 'src', 'index.js');
    
    backendProcess = spawn('node', [backendPath], {
        env: { ...process.env, PORT: port, NODE_ENV: 'production' },
        stdio: 'inherit'
    });

    try {
        await waitOn({ resources: [`http-get://localhost:${port}/api/auth/me`], timeout: 30000, validateStatus: () => true });
        mainWindow.loadURL(`http://localhost:${port}`);
    } catch (err) {
        console.error('Backend failed to start', err);
        mainWindow.loadFile('error.html');
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
