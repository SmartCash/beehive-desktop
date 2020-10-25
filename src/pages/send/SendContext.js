import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { WalletContext } from '../../context/WalletContext';
import { subtractFloats, sumFloats } from '../../lib/math';
import { calculateFee, createAndSendRawTransaction, getUnspent } from '../../lib/sapi';
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
        case 'setNetFee': {
            return {...state, netFee: action.payload };
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
        } else if (value < 0.001) {
            dispatch({type: 'setAmountToSendError', payload: 'The minimum amount to send is 0.001' });
        } else {
            dispatch({type: 'setAmountToSendError', payload: null });
        }
        dispatch({ type: 'setAmountToSend', payload: value});
    }

    const setAddressToSend = (value) => {
        isAddress(value)
        .then(() => {
            dispatch({ type: 'setAddressToSend', payload: value});
        })
        .catch(() => {
            dispatch({ type: 'setAddressToSendError', payload: true});
        });
    }

    function submitSendAmount() {
        // createAndSendRawTransaction(state.addressToSend, state.amountToSend, getPrivateKey())
        //     .then((data) => setTxId(data?.txid))
        //     .catch((error) => setError(error[0]?.message))
        //     .finally(() => setLoading(false));
    }

    function handleSelectedFiat (e) {
        const { value } = e.target;
        dispatch({ type: 'setSelectedFiat', payload: value});
    }

    function isSmartFiat() {
        return state.selectedFiat === 'smart';
    }

    async function calcSendFounds(percentage) {
        const _unspents = await getUnspent(walletCurrent);
        const _amount = Number(sumFloats(_unspents.utxos.map((utxo) => utxo.value)).toFixed(8) * percentage);
        const fee = await calculateFee(_unspents.utxos);
        const _balanceToSend = subtractFloats(_amount, fee);
        dispatch({type: 'setAmountToSendError', payload: null });
        dispatch({ type: 'setNetFee', payload: fee});
        dispatch({ type: 'setAmountToSend', payload: _balanceToSend});
    }

    function getPrivateKey() {
        const wallet = wallets.find(wallet => wallet.address === walletCurrent);
        return wallet?.privateKey;
    }

    function canSend() {
        return false;
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
        calcSendFounds,
        getPrivateKey,
        canSend
    };

    return <SendContext.Provider value={providerValue}>{children}</SendContext.Provider>;
};
