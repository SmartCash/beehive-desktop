import React, { createContext, useEffect, useReducer } from 'react';
import { getSupportedCurrencies } from '../lib/smart';
import { getBalance, getSpendableInputs } from '../lib/sapi';
import * as CryptoJS from 'crypto-js';
import generatePDF from '../lib/GeneratorPDF';
const { ipcRenderer } = window.require('electron');

const initialState = {
    wallets: [],
    walletCurrent: '',
    fiatList: [],
    walletsBalance: {},
    masterKey: null,
};

const _getBalance = async (address) => {
    const getBalanceFromSapi = async () => {
        const balanceResponse = await getBalance(address);
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

            const encryptedWallet = CryptoJS.AES.encrypt(JSON.stringify(_wallets), state.masterKey).toString();

            ipcRenderer.send('setWalletData', encryptedWallet);

            return { ...state, wallets: _wallets };
        }
        case 'setWalletCurrent': {
            return { ...state, walletCurrent: action.payload };
        }
        case 'setFiatList': {
            return { ...state, fiatList: action.payload };
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
        case 'saveMasterKey': {
            return { ...state, masterKey: action.payload };
        }
        case 'decryptError': {
            return { ...state, decryptError: action.payload };
        }
        case 'updateWalletsBalance': {
            //ToDo: Criar método com linha 40 a 42 para salvar wallets em arquivo local com balanco atualizado
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

    async function addWallet(wallet) {
        const exists = state.wallets.find((_wallet) => _wallet.address === wallet.address);

        if (exists) {
            return;
        }

        if (state.wallets.length === 0) {
            dispatch({ type: 'setWalletCurrent', payload: wallet.address });
        }

        wallet.balance = await _getBalance(wallet.address);

        wallet.unspent = await getSpendableInputs(wallet.address);

        dispatch({ type: 'addWallet', payload: wallet });
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

    async function saveMasterKey(masterKey) {
        const encryptedWallet = ipcRenderer.sendSync('getWalletData');
        let wallets = [];
        let decryptedWallet;
        if (encryptedWallet) {
            try {
                decryptedWallet = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(encryptedWallet, masterKey));
            } catch (e) {
                return dispatch({ type: 'decryptError', payload: true });
            }
            if (decryptedWallet) {
                wallets = JSON.parse(decryptedWallet);

                for (const wallet of wallets) {
                    const balance = await _getBalance(wallet.address);
                    if (balance) {
                        wallet.balance = balance;
                        wallet.unspent = await getSpendableInputs(wallet.address);
                    }
                }

                dispatch({ type: 'updateWallets', payload: wallets });
            }
        } else {
            dispatch({ type: 'updateWallets', payload: wallets });
        }

        updateWalletsBalance();
        dispatch({ type: 'saveMasterKey', payload: masterKey });
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
        setInterval(() => {
            updateWalletsBalance();
        }, 60000);
    }, []);

    const providerValue = {
        ...state,
        addWallet,
        setWalletCurrent,
        updateBalance,
        updateWalletsBalance,
        saveMasterKey,
        downloadWallets,
        getAndUpdateWalletsBallance,
    };

    return <WalletContext.Provider value={providerValue}>{children}</WalletContext.Provider>;
};
