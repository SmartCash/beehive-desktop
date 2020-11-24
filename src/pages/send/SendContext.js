import React, { createContext, useContext, useEffect, useReducer } from 'react';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { WalletContext } from '../../context/WalletContext';
import { subtractFloats, sumFloats, sumFloatsValues } from '../../lib/math';
import { calculateFee, createAndSendRawTransaction, getUnspent, getFee } from '../../lib/sapi';
import { isAddress } from '../../lib/smart';

const initialValue = {
    amountToSend: 0,
    selectedFiat: 'smart'
};

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
        case 'setTXIDLoading': {
            return {...state, TXIDLoading: action.payload };
        }
        case 'setTXID': {
            return {...state, TXID: action.payload };
        }
        case 'setTXIDError': {
            return {...state, TXIDError: action.payload };
        }
        case 'clearState': {
            return initialValue
        }
        default: {
            return state;
        }
    }
};

export const SendContext = createContext(initialValue);

export const SendProvider = ({ children }) => {
    const [state, dispatch] = useReducer(sendReducer, initialValue);
    const { wallets, walletCurrent, fiatList, updateWalletsBalance } = useContext(WalletContext);

    const defaultMaskOptions = {
        prefix: '',
        suffix: '',
        allowDecimal: true,
        decimalSymbol: '.',
        decimalLimit: 8,
        integerLimit: 15,
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
            getFee(Number(value), state.addressToSend)
            .then(fee => dispatch({ type: 'setNetFee', payload: fee }));
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

    useEffect(() => {
        dispatch({ type: 'clearState' });
    }, [walletCurrent])

    function submitSendAmount() {
        dispatch({ type: 'setTXIDLoading', payload: true });
        createAndSendRawTransaction(state.addressToSend, Number(state.amountToSend), getPrivateKey())
            .then((data) => {
                updateWalletsBalance();
                dispatch({ type: 'setTXID', payload: data?.txid});
            })
            .catch((error) => dispatch({ type: 'setTXIDError', payload: error[0]?.message}))
            .finally(() => dispatch({ type: 'setTXIDLoading', payload: false }));
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
        return state.amountToSendError === null && state.addressToSendError === false && !state.TXIDLoading;
    }

    const totalInSmart = sumFloatsValues(state.amountToSend, state.netFee);

    const providerValue = {
        ...state,
        walletCurrent,
        walletCurrentBalance: wallets.find(wallet => wallet.address === walletCurrent)?.balance,
        fiatList,
        currencyMask,
        setAmountToSend,
        setAddressToSend,
        submitSendAmount,
        handleSelectedFiat,
        isSmartFiat,
        calcSendFounds,
        canSend,
        totalInSmart
    };

    return <SendContext.Provider value={providerValue}>{children}</SendContext.Provider>;
};
