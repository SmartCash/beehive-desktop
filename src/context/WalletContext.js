import React, { createContext, useEffect, useReducer } from 'react';
import { getSupportedCurrencies } from '../lib/smart';
import { getUnspent, calculateFee } from '../lib/sapi';
import { subtractFloats, sumFloats } from '../lib/math';
import * as CryptoJS from "crypto-js";

const initialState = {
    wallets: null,
    walletCurrent: '',
    fiatList: [],
    walletsBalance: 0,
    masterKey: null,
};

const _getBalance = async (address) => {
    const _unspents = await getUnspent(address);
    if (_unspents && _unspents.utxos) {
        const _balance = Number(sumFloats(_unspents.utxos.map((utxo) => utxo.value)).toFixed(8));
        return Number(_balance.toFixed(8));
    }
    return 0;
}

const userReducer = (state, action) => {
    switch (action.type) {
        case 'addWallet': {
            const _wallets = [...state.wallets, action.payload];
            const encryptedWallet = CryptoJS.AES.encrypt(JSON.stringify(_wallets), state.masterKey);
            localStorage.setItem('SMARTWALLET', encryptedWallet);
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
            return {...state, walletsBalance: action.payload };
        }
        case 'saveMasterKey': {
            return {...state, masterKey: action.payload };
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
        const exists = state.wallets.find(_wallet => _wallet.address === wallet.address);
        if (exists) {
            return;
        }
        wallet.balance = await _getBalance(wallet.address) || 0;
        if (state.wallets.length === 0) {
            dispatch({ type: 'setWalletCurrent', payload: wallet.address });
        }
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

    function saveMasterKey(masterKey) {
        dispatch({ type: 'saveMasterKey', payload: masterKey });
    }

    useEffect(() => {
        if (state.fiatList.length === 0) {
            loadFiats();
        }
        if (state.masterKey && !state.wallets) {
            const encryptedWallet = localStorage.getItem('SMARTWALLET');
            let wallets = [];
            if (encryptedWallet) {
                const decryptedWallet = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(encryptedWallet, state.masterKey));
                console.log(decryptedWallet);
                wallets = decryptedWallet ? JSON.parse(decryptedWallet) : [];
            }
            dispatch({ type: 'updateWallets', payload: wallets });
        }
    }, [state.masterKey]);

    const providerValue = {
        ...state,
        addWallet,
        setWalletCurrent,
        updateBalance,
        saveMasterKey
    };

    return <WalletContext.Provider value={providerValue}>{children}</WalletContext.Provider>;
};
