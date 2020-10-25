import React, { createContext, useCallback, useContext, useReducer } from 'react';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { WalletContext } from '../../context/WalletContext';
import { isAddress } from '../../lib/smart';

const sendReducer = (state, action) => {
    switch(action.type) {
        case 'setAmountToSend': {
            return {...state, amountToSend: action.payload };
        }
        case 'setAmountToSendError': {
            return {...state, amountToSendError: action.payload };
        }
        case 'setAddressToSend': {
            return {...state, addressToSend: action.payload, addressToSendError: false };
        }
        case 'setAddressToSendError': {
            return {...state, addressToSendError: action.payload, addressToSend: null };
        }
        case 'setSelectedFiat': {
            return {...state, selectedFiat: action.payload };
        }
        default: {
            return state;
        }
    }
};

const initialValue = {
    amountToSend: 0,
    selectedFiat: 'smart'
};

export const SendContext = createContext(initialValue);

export const SendProvider = ({ children }) => {
    const [state, dispatch] = useReducer(sendReducer, initialValue);
    const { wallets, walletCurrent, fiatList } = useContext(WalletContext);

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
        const { balance } = wallets.find(wallet => wallet.address === walletCurrent);
        if (value >= balance) {
            dispatch({type: 'setAmountToSendError', payload: 'Exceeds balance' });
            return
        }
        if (value < 0.001) {
            dispatch({type: 'setAmountToSendError', payload: 'The minimum amount to send is 0.001' });
            return;
        }
        dispatch({type: 'setAmountToSendError', payload: null });
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

    function submitSendAmount() {
        // createAndSendRawTransaction(state.addressToSend, Number(amountToSend), String(privateKey || data?.privateKey))
            // .then((data) => setTxId(data?.txid))
            // .catch((error) => setError(error[0]?.message))
            // .finally(() => setLoading(false));
    }

    function handleSelectedFiat (e) {
        const { value } = e.target;
        dispatch({ type: 'setSelectedFiat', payload: value});
    }

    function isSmartFiat() {
        return state.selectedFiat === 'smart';
    }

    function calcSendFounds(percentage) {
        const _wallet = wallets.find(wallet => wallet.address === walletCurrent);
        const { balance } = _wallet;

        // dispatch({ type: 'setAmountToSend', payload: value});
    }

    const providerValue = {
        ...state,
        walletCurrent,
        fiatList,
        currencyMask,
        setAmountToSend,
        setAddressToSend,
        submitSendAmount,
        handleSelectedFiat,
        isSmartFiat,
        calcSendFounds
    };

    return <SendContext.Provider value={providerValue}>{children}</SendContext.Provider>;
};
