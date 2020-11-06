const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const isDev = require('electron-is-dev');
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: '',
    });

    // autoUpdate();

    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    mainWindow.on('closed', () => (mainWindow = null));
}

function autoUpdate() {
    const server = 'https://update.electronjs.org'
    const feed = `${server}/SmartCash/smarthub_local/${process.platform}-${process.arch}/${app.getVersion()}`

    console.log(`Current version: ${app.getVersion()}`)

    electron.autoUpdater.setFeedURL(feed)
    electron.autoUpdater.checkForUpdates()

    electron.autoUpdater.on('checking-for-update', () => {
        console.log('checking-for-update')
    })

    electron.autoUpdater.on('update-available', () => {
        console.log('update-available')
    })

    electron.autoUpdater.on('update-not-available', () => {
        console.log('update-not-available')
    })

    electron.autoUpdater.on(
        'update-downloaded',
        (event, releaseNotes, releaseName, updateURL) => {
            console.log('update-downloaded', {
                event,
                releaseNotes,
                releaseName,
                updateURL
            })
        }
    )

    electron.autoUpdater.on('error', error => {
        console.log('error', { error })
    })
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
