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
git clone https://github.com/SmartCash/smarthub_local.git
cd smarthub_local
git checkout develop
npm i
npm start
```

## Install Dependencies
sudo apt install git npm<br />
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -<br />
sudo apt install nodejs<br />
git clone https://github.com/SmartCash/smarthub_local.git<br />

## Install and Run
npm install<br />
npm start<br />

### Your equivalent to wallet.dat but called config.json is stored at:

```
home User's home directory.
appData Per-user application data directory, which by default points to:

    %APPDATA% on Windows
    $XDG_CONFIG_HOME or ~/.config on Linux
    ~/Library/Application Support on macOS
```
