import React, { createContext, useEffect, useReducer } from 'react';
import { getSupportedCurrencies } from '../lib/smart';
import { getNodesUrl } from '../lib/sapi';
import {
    getBalance,
    getSpendableInputs,
    createRSAKeyPair,
    encryptTextWithReceiverRSAPublicKey,
    decryptTextWithRSAPrivateKey,
} from '../lib/sapi';
import * as CryptoJS from 'crypto-js';
import generatePDF from '../lib/GeneratorPDF';
const { ipcRenderer } = window.require('electron');

const initialState = {
    wallets: [],
    walletCurrent: '',
    fiatList: [],
    nodesList: [],
    walletsBalance: {},
    password: null,
};

const _getBalance = async (address) => {
    const getBalanceFromSapi = async () => {
        const balanceResponse = await getBalance(address);
        balanceResponse.balance.unlocked = balanceResponse.balance.unlocked + balanceResponse.unconfirmed.delta;
        return balanceResponse.balance;
    };
    let balance = {};
    try {
        balance = await getBalanceFromSapi();
    } catch {
        balance = await getBalanceFromSapi();
    }
    return balance;
};

const userReducer = (state, action) => {
    switch (action.type) {
        case 'addWallet': {
            const _wallets = [...state.wallets, action.payload];
            return { ...state, wallets: _wallets };
        }
        case 'setWalletCurrent': {
            return { ...state, walletCurrent: action.payload };
        }
        case 'setFiatList': {
            return { ...state, fiatList: action.payload };
        }
        case 'setNodesList': {
            return { ...state, nodesList: action.payload };
        }
        case 'updateWallets': {
            if (action.payload.length > 0) {
                return { ...state, wallets: action.payload, walletCurrent: action.payload[0].address };
            }
            return { ...state, wallets: action.payload };
        }
        case 'updateBalance': {
            return { ...state, walletsBalance: action.payload };
        }
        case 'decryptWallets': {
            return { ...state, password: action.payload };
        }
        case 'decryptError': {
            return { ...state, decryptError: action.payload };
        }
        case 'updateWalletsBalance': {
            if (state.wallets === null) {
                return state;
            }
            const _wallets = state.wallets;
            const _walletsBalance = _wallets.map((wallet) => wallet.balance || {});

            return { ...state, walletsBalance: _walletsBalance };
        }
        default: {
            return state;
        }
    }
};

export const WalletContext = createContext(initialState);

export const WalletProvider = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, initialState);

    async function addWallet(wallet, password) {
        const exists = state.wallets.find((_wallet) => _wallet.address === wallet.address);

        if (exists) {
            return;
        }

        if (state.wallets.length === 0) {
            dispatch({ type: 'setWalletCurrent', payload: wallet.address });
        }

        if (!wallet.RSA) {
            wallet.RSA = createRSAKeyPair(password);
        }

        let rsaMessage = encryptTextWithReceiverRSAPublicKey(wallet.RSA.rsaPublicKey, 'Oie');
        console.log(`RSA encrypted Message with PUB_KEY`, rsaMessage);
        let textMessage = decryptTextWithRSAPrivateKey(wallet.RSA.rsaPrivateKey, password, rsaMessage);
        console.log(`RSA DEcrypted Message with PRIV_KEY`, textMessage);

        wallet.balance = await _getBalance(wallet.address);
        wallet.unspent = await getSpendableInputs(wallet.address);

        const _wallets = [...state.wallets, wallet];

        const encryptedWallet = CryptoJS.AES.encrypt(JSON.stringify(_wallets), password).toString();
        ipcRenderer.send('setWalletData', encryptedWallet);

        dispatch({ type: 'updateWallets', payload: _wallets });
    }

    function setWalletCurrent(wallet) {
        dispatch({ type: 'setWalletCurrent', payload: wallet.address });
    }

    async function loadFiats() {
        dispatch({ type: 'setFiatList', payload: await getSupportedCurrencies() });
    }

    async function loadNodes() {
        let nodes =  await getNodesUrl();
        dispatch({ type: 'setNodesList', payload: nodes});
    }

    function updateBalance(balance) {
        dispatch({ type: 'updateBalance', payload: balance });
    }

    function saveWalletsInStorage(wallets, password) {
        const encryptedWallet = CryptoJS.AES.encrypt(JSON.stringify(wallets), password).toString();
        ipcRenderer.send('setWalletData', encryptedWallet);
    }

    function getWalletsFromStorage(password) {
        const encryptedWallet = ipcRenderer.sendSync('getWalletData');
        const decryptedWallet = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(encryptedWallet, password));
        return JSON.parse(decryptedWallet);
    }

    async function decryptWallets(password) {
        const encryptedWallet = ipcRenderer.sendSync('getWalletData');
        let wallets = [];
        let decryptedWallet;

        if (encryptedWallet) {
            try {
                decryptedWallet = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(encryptedWallet, password));
            } catch (e) {
                return dispatch({ type: 'decryptError', payload: true });
            }

            if (decryptedWallet) {
                wallets = JSON.parse(decryptedWallet);

                for (const wallet of wallets) {
                    if (!wallet.RSA) {
                        wallet.RSA = createRSAKeyPair(password);
                    }

                    let rsaMessage = encryptTextWithReceiverRSAPublicKey(wallet.RSA.rsaPublicKey, 'Oie');
                    let textMessage = decryptTextWithRSAPrivateKey(wallet.RSA.rsaPrivateKey, password, rsaMessage);

                    if (!CryptoJS.AES.decrypt(wallet.privateKey, password))
                        wallet.privateKey = CryptoJS.AES.encrypt(wallet.privateKey, password).toString();

                        try {
                            const balance = await _getBalance(wallet.address);
                            if (balance) {
                                wallet.balance = balance;
                                wallet.unspent = await getSpendableInputs(wallet.address);
                            }
                        } catch (error) {
                            return error;
                        }

                }

                dispatch({ type: 'updateWallets', payload: wallets });
            }
        } else {
            dispatch({ type: 'updateWallets', payload: wallets });
        }

        updateWalletsBalance();
        return wallets;
    }

    function downloadWallets() {
        generatePDF(state.wallets, 'MyWallets_SmartCash');
    }

    function updateWalletsBalance() {
        dispatch({ type: 'updateWalletsBalance' });
    }

    async function getAndUpdateWalletsBallance() {
        const _wallets = await Promise.all(
            state.wallets.map(async (wallet) => {
                wallet.balance = (await _getBalance(wallet.address)) || {};
                wallet.unspent = (await getSpendableInputs(wallet.address)) || {};
                return wallet;
            })
        );

        dispatch({ type: 'updateWallets', payload: _wallets });
        dispatch({ type: 'updateWalletsBalance' });
    }

    useEffect(() => {
        if (state.fiatList.length === 0) {
            loadFiats();
        }

        if(state.nodesList.length === 0){
            loadNodes();
        }

        setInterval(() => {
            //updateWalletsBalance();
            getAndUpdateWalletsBallance();
            console.log('entrou no timer');
        }, 30000);
    }, []);

    const providerValue = {
        ...state,
        addWallet,
        setWalletCurrent,
        updateBalance,
        updateWalletsBalance,
        decryptWallets,
        downloadWallets,
        getAndUpdateWalletsBallance,
    };

    return <WalletContext.Provider value={providerValue}>{children}</WalletContext.Provider>;
};
