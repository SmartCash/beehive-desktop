const electron = require('electron');
const fetch = require('node-fetch');

module.exports = async function setUpdateNotification(option) {
    if (electron.app.isReady) {
        await checkUpdate(option)
    } else {
        electron.app.on('ready', async () => {
            await checkUpdate(option)
        })
    }
}

async function checkUpdate({ repository, token }) {
    if (!electron.app.isPackaged) return
    try {
        const res = await fetch(
            `https://api.github.com/repos/${repository}/releases`,
            {
                headers: token ? { authorization: `token ${token}` } : {},
            },
        )
        const json = await res.json()
        const latest = json[0]
        if (!latest) return

        const latestVersion = latest.tag_name.startsWith('v')
            ? latest.tag_name.slice(1)
            : latest.tag_name

        if (latestVersion != electron.app.getVersion()) {
            electron.dialog.showMessageBox(
                null,
                {
                    message: `New release available: ${latestVersion}\n\n${latest.body}`,
                    buttons: ['Download', 'Later'],
                    defaultId: 0
                }
            ).then(({ response }) => {
                if (response === 0) {
                    electron.shell.openExternal(latest.html_url)
                }
            })
        }
    } catch (err) {
        console.error(err)
    }
}

