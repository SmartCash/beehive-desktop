import React, { createContext, useEffect, useReducer } from 'react';
import { getSupportedCurrencies } from '../lib/smart';
import { getUnspent, calculateFee } from '../lib/sapi';
import { subtractFloats, sumFloats } from '../lib/math';

const initialState = {
    wallets: [],
    walletCurrent: '',
    fiatList: [],
    walletsBalance: 0,
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

    useEffect(() => {
        if (state.fiatList.length === 0) {
            loadFiats();
        }
    }, []);

    const providerValue = {
        ...state,
        addWallet,
        setWalletCurrent,
        updateBalance
    };

    return <WalletContext.Provider value={providerValue}>{children}</WalletContext.Provider>;
};
