import React, { createContext, useReducer } from 'react';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { isAddress } from '../../lib/smart';

const sendReducer = (state, action) => {
    switch(action.type) {
        case 'setAmountToSend': {
            return {...state, amountToSend: action.payload };
        }
        case 'setAddressToSend': {
            return {...state, addressToSend: action.payload, addressToSendError: false };
        }
        case 'setAddressToSendError': {
            return {...state, addressToSendError: action.payload, addressToSend: null };
        }
        default: {
            return state;
        }
    }
};

const initialValue = {};

export const SendContext = createContext(initialValue);

export const SendProvider = ({ children }) => {
    const [state, dispatch] = useReducer(sendReducer, initialValue);

    const defaultMaskOptions = {
        prefix: '',
        suffix: '',
        includeThousandsSeparator: true,
        thousandsSeparatorSymbol: '',
        allowDecimal: true,
        decimalSymbol: '.',
        decimalLimit: 8,
        integerLimit: 30,
        allowNegative: false,
        allowLeadingZeroes: false,
    };
    const currencyMask = createNumberMask(defaultMaskOptions);

    const setAmountToSend = (value) => {
        dispatch({ type: 'setAmountToSend', payload: value});
    }

    const setAddressToSend = (value) => {
        isAddress(value)
        .then((data) => {
            dispatch({ type: 'setAddressToSend', payload: value});
        })
        .catch((error) => {
            dispatch({ type: 'setAddressToSendError', payload: true});
        });

    }

    const providerValue = {
        ...state,
        currencyMask,
        setAmountToSend,
        setAddressToSend
    };

    return <SendContext.Provider value={providerValue}>{children}</SendContext.Provider>;
};
