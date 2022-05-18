# BeeHive Desktop
This an SAPI based wallet that is 100% decentralized using SAPI layer on Smartnodes. With this you don't need to sync any blockchain or run any servers.

### Linux dependencies

```
sudo apt update -y
sudo apt upgrade -y
sudo apt install build-essential git npm curl -y

Only use for Ubuntu20 or before:  curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -

sudo apt install nodejs -y
```

## Cloning the correct repo and branch

```
git clone https://github.com/SmartCash/beehive-desktop.git
cd beehive-desktop
git checkout master
```

## Install dev dependencies, app dependencies and RUN the electron app

```
npm i
npm start
```

## Install it all in one if you are using linux, then just run:

```
sudo apt update -y && sudo apt upgrade -y && sudo apt install build-essential git npm curl -y && curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash - && sudo apt install nodejs -y && git clone https://github.com/SmartCash/beehive-desktop.git && cd beehive-desktop && npm i && npm start
```

### Your equivalent to wallet.dat but called config.json is stored at:

```
home User's home directory.
appData Per-user application data directory, which by default points to:

    %APPDATA% on Windows
    $XDG_CONFIG_HOME or ~/.config on Linux
    ~/Library/Application Support on macOS
```




## Generate Windows build version

Remove package-lock.json and node_modules, so run the follow code:

npm install && npm run build

==========


## NPM known issues

If you are using NPM 7+ you might have issues to install dependencies. So the solution is downgrade to 6+ along with downgrading pdf package.

```
npm install npm@6.14.11 -g
npm install jspdf@1.5.3 -g
```

https://github.com/facebook/create-react-app/issues/10749
