import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { WalletContext } from '../../context/WalletContext';

const initialValue = {
    password: '',
    TXError: ''
};

const sendReducer = (state, action) => {
    switch (action.type) {
        case 'setPassword': {
            return { ...state, password: action.payload };
        }
        case 'setTXError': {
            return { ...state, TXError: action.payload };
        }
        default: {
            return state;
        }
    }
}

export const ActivateContext = createContext(initialValue);

export const ActivateProvider = ({ children }) => {
    const [state, dispatch] = useReducer(sendReducer, initialValue);
    const { wallets } = useContext(WalletContext);

    const setPassword = (value) => {        
        dispatch({ type: 'setPassword', payload: value });
    };

    function canSend() {        
        return state.password !== '';
    }

    function hasPassword(){
        return state.password;
    }

    const providerValue = {
        ...state,
        setPassword,
        canSend,
        hasPassword
    };

    return <ActivateContext.Provider value={providerValue}>{children}</ActivateContext.Provider>;
};