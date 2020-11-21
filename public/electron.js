const setUpdateNotification = require('./updateNotifier');
const { ipcMain, app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: __dirname + 'favicon.ico',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            disableBlinkFeatures: 'OutOfBlinkCors',
        },
    });

    mainWindow.setMenu(null);

    setUpdateNotification({ repository: 'SmartCash/smarthub_local' });

    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('setWalletData', (event, arg) => {
    store.set('wallets', `${arg}`);
});

ipcMain.on('getWalletData', (event) => {
    event.returnValue = store.get('wallets');
});
