import React, { createContext, useEffect, useReducer } from 'react';
import { getSupportedCurrencies } from '../lib/smart';

import { getBalance, getBalances, createRSAKeyPair } from '../lib/sapi';
import * as CryptoJS from 'crypto-js';
import generatePDF from '../lib/GeneratorPDF';
const { ipcRenderer } = window.require('electron');

const initialState = {
    wallets: [],
    walletCurrent: '',
    fiatList: [],
    walletsBalance: {},
    password: null,
};

const getBalanceFromSAPI = async (address) => {
    let balance = {};
    try {
        balance = await getBalance(address);
    } catch {
        balance = await getBalance(address);
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
        case 'updateWallets': {
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

        wallet.balance = await getBalanceFromSAPI(wallet.address);

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

                await getAndUpdateWalletsBallance(wallets);

                for (const wallet of wallets) {
                    if (!wallet.RSA) {
                        wallet.RSA = createRSAKeyPair(password);
                    }

                    if (!CryptoJS.AES.decrypt(wallet.privateKey, password))
                        wallet.privateKey = CryptoJS.AES.encrypt(wallet.privateKey, password).toString();
                }

                dispatch({ type: 'setWalletCurrent', payload: wallets[0].address });
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

    async function getAndUpdateWalletsBallance(wallets) {
        const walletsAux = state.wallets ? state.wallets : wallets;
        const balances = await getBalances(walletsAux.map((wallet) => wallet.address));
        const _wallets = await Promise.all(
            walletsAux.map(async (wallet) => {
                wallet.balance = balances.find((balance) => balance.address === wallet.address);
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
