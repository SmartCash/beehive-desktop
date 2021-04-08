import {
    createRSAKeyPair,
    getAddressesBalances,
    getBalance,
    getBalances,
    tryToDecryptAES,
    isEncryptedAES,
    tryToEncryptAES,
} from 'application/lib/sapi';
import { getSupportedCurrencies } from 'application/lib/smart';
import * as CryptoJS from 'crypto-js';
import React, { createContext, useEffect, useReducer } from 'react';
import { compile } from 'smartcashjs-lib/src/script';
const { ipcRenderer } = window.require('electron');

const initialState = {
    wallets: [],
    walletCurrent: '',
    fiatList: [],
    password: null,
    wrongPassError: false,
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
        case 'password': {
            return { ...state, password: action.payload };
        }
        case 'wrongPassError': {
            return { ...state, wrongPassError: action.payload };
        }
        default: {
            return state;
        }
    }
};

export const WalletContext = createContext(initialState);

export const WalletProvider = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, initialState);

    async function addWallet(wallet, password, emptyBalance = false) {
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

        if (!emptyBalance) {
            wallet.balance = await getBalanceFromSAPI(wallet.address);
        } else {
            wallet.balance = {
                locked: 0,
                total: 0,
                unlocked: 0,
            };
        }

        const _wallets = [...state.wallets, wallet];

        const encryptedWallet = tryToEncryptAES({ text: _wallets, stringify: true, password: password });
        await ipcRenderer.send('setWalletData', encryptedWallet);

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
        const encryptedWallet = tryToEncryptAES({ text: wallets, stringify: true, password: password });
        ipcRenderer.send('setWalletData', encryptedWallet);
    }

    function getWalletsFromStorage(password) {
        const encryptedWallet = ipcRenderer.sendSync('getWalletData');
        const decryptedWallet = tryToDecryptAES({ text: encryptedWallet, password: password });
        return JSON.parse(decryptedWallet);
    }

    async function decryptWallets(password) {
        const encryptedWallet = ipcRenderer.sendSync('getWalletData');

        let wallets = [];
        let decryptedWallet;

        if (encryptedWallet) {
            try {
                decryptedWallet = tryToDecryptAES({ text: encryptedWallet, password: password });
            } catch (e) {
                return dispatch({ type: 'decryptError', payload: true });
            }

            if (decryptedWallet) {
                wallets = JSON.parse(decryptedWallet);

                await getAndUpdateWalletsBallance(wallets);

                for (const wallet of wallets) {
                    if (!wallet.RSA) wallet.RSA = createRSAKeyPair(password);

                    if (!isEncryptedAES({ text: wallet.privateKey, password: password }))
                        wallet.privateKey = tryToEncryptAES({ text: wallet.privateKey, password: password });
                }

                const encryptedWallet = tryToEncryptAES({ text: wallets, password: password, stringify: true });
                await ipcRenderer.send('setWalletData', encryptedWallet);

                dispatch({ type: 'setWalletCurrent', payload: wallets[0].address });
                dispatch({ type: 'updateWallets', payload: wallets });
            }
        } else {
            dispatch({ type: 'updateWallets', payload: wallets });
        }
        return wallets;
    }

    async function getAndUpdateWalletsBallance(wallets) {
        const walletsAux = wallets ? wallets : state.wallets;

        const getAddressesBalances = await getAddressesBalances({ addresses: walletsAux?.map((wallet) => wallet.address) });

        dispatch({ type: 'updateWallets', payload: _wallets });
    }

    function updateWalletsFunc(wallets) {
        dispatch({ type: 'updateWallets', payload: wallets });
    }

    function setPassword(pass) {
        dispatch({ type: 'password', payload: pass });
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
        decryptWallets,
        getAndUpdateWalletsBallance,
        updateWalletsFunc,
        setPassword,
    };

    return <WalletContext.Provider value={providerValue}>{children}</WalletContext.Provider>;
};
