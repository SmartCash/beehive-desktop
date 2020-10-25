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

    function addWallet(wallet) {
        if (state.wallets.length === 0) {
            dispatch({ type: 'setWalletCurrent', payload: wallet.address });
        }
        dispatch({ type: 'addWallet', payload: wallet });
    }

    async function loadFiats() {
        dispatch({ type: 'setFiatList', payload: await getSupportedCurrencies() });
    }

    function getWalletsBalance() {
        const _wallets = state.wallets.map((wallet) => {
            const _getBalance = async () => {
                const _unspents = await getUnspent(wallet.address);
                const _amount = Number(sumFloats(_unspents.utxos.map((utxo) => utxo.value)).toFixed(8));
                const _balance = subtractFloats(_amount, await calculateFee(_unspents.utxos));
                wallet.balance = Number(_balance.toFixed(8));
            }
            _getBalance();
            return wallet;
        });
        dispatch({ type: 'updateWallets', payload: _wallets });
    }

    function updateBalance() {
        const getBalance = () => {
            const reducer = (accumulator, currentValue) => accumulator + currentValue;
            return state.wallets
                .map(wallet => wallet.balance)
                .reduce(reducer, 0);
        }
        dispatch({ type: 'updateBalance', payload: getBalance() });
    }

    useEffect(() => {
        if (state.fiatList.length === 0) {
            loadFiats();
        }
        getWalletsBalance();
        updateBalance();
    }, []);

    const providerValue = {
        ...state,
        addWallet,
        getWalletsBalance
    };

    return <WalletContext.Provider value={providerValue}>{children}</WalletContext.Provider>;
};
