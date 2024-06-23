import { BrowserWindow, app, dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('src/index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle file open request from renderer
ipcMain.handle('open-file', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Verse Files', extensions: ['verse'] }],
    });

    if (result.canceled || result.filePaths.length === 0) {
        return null;
    }

    const filePath = result.filePaths[0];
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return { filePath, fileContent };
});

// Handle file save request from renderer
ipcMain.handle('save-file', async (event, data) => {
    const result = await dialog.showSaveDialog({
        defaultPath: data.filePath,
        filters: [{ name: 'Text Files', extensions: ['txt'] }],
    });

    if (result.canceled || !result.filePath) {
        return;
    }

    await fs.promises.writeFile(result.filePath, data.content, 'utf-8');
});
