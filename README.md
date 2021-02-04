# SmartHub
This is the smart hub wallet that is 100% decentralized using SAPI. With this you don't need to sync any blockchain.

### Linux dependencies

```
sudo apt update -y
sudo apt upgrade -y
sudo apt install build-essential -y
sudo apt install git npm -y
sudo apt install curl -y
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install nodejs -y
```

## Cloning the correct repo and branch

```
git clone https://github.com/SmartCash/smarthub_local.git
cd smarthub_local
git checkout develop
```

## Install dev dependencies, app dependencies and RUN the electron app

```
npm i
npm start
```

### Your equivalent to wallet.dat but called config.json is stored at:

```
home User's home directory.
appData Per-user application data directory, which by default points to:

    %APPDATA% on Windows
    $XDG_CONFIG_HOME or ~/.config on Linux
    ~/Library/Application Support on macOS
```
