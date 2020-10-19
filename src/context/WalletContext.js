import React, { createContext, useReducer } from 'react';

const initialState = {};

const userReducer = (state, action) => {
    
}

export const WalletContext = createContext({});

export const WalletProvider = ({ children }) => {

    const [state, dispatch] = useReducer(userReducer, initialState);

    const wallets = [
        {
            label: 'Wallet 1',
            address: 'SXuLDkBBs2H6FA6jkHSfoEW9gQmX7wRpvx',
            balance: 10
        },
        {
            label: 'Wallet 2',
            address: 'SQrMADJm6uF9bJhoZjFZ3mjGfv2FgBVvWg',
            balance: 0
        }
    ];
    const walletSelected = wallets[0];

    const addWallet = () => {
        wallets.push({
            address: 'SQrMADJm6uF9bJhoZjFZ3mjGfv2FgBVvWg',
            balance: 0
        })
    }

    const providerValue = {
        wallets,
        walletSelected,
        addWallet
    };

    return <WalletContext.Provider value={providerValue}>{children}</WalletContext.Provider>;
};
