import React, { createContext, useReducer } from 'react';

const initialState = {
    wallets: [],
    walletCurrent: {}
};

const userReducer = (state, action) => {
    switch (action.type) {
        case 'add': {
            const _wallets = [...state.wallets, action.payload];
            return { ...state, wallets: _wallets };
        }
        case 'setWalletCurrent': {
            return { ...state, walletCurrent: action.payload };
        }
        default: {
            return state;
        }
    }
}

export const WalletContext = createContext({});

export const WalletProvider = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, initialState);

    const addWallet = (wallet) => {
        const _wallet = {
            ...wallet,
            balance: 0
        }
        if (state.wallets.length === 0) {
            dispatch({ type: 'setWalletCurrent', payload: _wallet});
        }
        dispatch({ type: 'add', payload: _wallet});
    }

    const providerValue = {
        ...state,
        addWallet
    };

    return <WalletContext.Provider value={providerValue}>{children}</WalletContext.Provider>;
};
