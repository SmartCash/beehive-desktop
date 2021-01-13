import React, { createContext, useContext, useEffect, useReducer } from 'react';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { WalletContext } from '../../context/WalletContext';
import { subtractFloats, sumFloats, sumFloatsValues, exceeds } from '../../lib/math';
import { calculateFee, createAndSendRawTransaction, getUnspent } from '../../lib/sapi';
import { isAddress } from '../../lib/smart';

const initialValue = {
    amountToSend: 0,
    selectedFiat: 'smart',
    messageToSend: '',
};

const sendReducer = (state, action) => {
    switch (action.type) {
        case 'setAmountToSend': {
            return { ...state, amountToSend: action.payload };
        }
        case 'setMessageToSend': {
            return { ...state, messageToSend: action.payload };
        }
        case 'setAmountToSendError': {
            return { ...state, amountToSendError: action.payload };
        }
        case 'setAddressToSend': {
            return { ...state, addressToSend: action.payload, addressToSendError: false };
        }
        case 'setAddressToSendError': {
            return { ...state, addressToSendError: action.payload, addressToSend: null };
        }
        case 'setSelectedFiat': {
            return { ...state, selectedFiat: action.payload };
        }
        case 'setNetFee': {
            return { ...state, netFee: action.payload };
        }
        case 'setTXIDLoading': {
            return { ...state, TXIDLoading: action.payload };
        }
        case 'setTXID': {
            return { ...state, TXID: action.payload };
        }
        case 'setTXIDError': {
            return { ...state, TXIDError: action.payload };
        }
        case 'clearState': {
            if (document.getElementById('addressTo')) {
                document.getElementById('addressTo').value = '';
            }
            if (document.getElementById('messageTo')) {
                document.getElementById('messageTo').value = '';
            }
            return { ...initialValue };
        }
        default: {
            return state;
        }
    }
};

export const SendContext = createContext(initialValue);

export const SendProvider = ({ children }) => {
    const [state, dispatch] = useReducer(sendReducer, initialValue);
    const { wallets, walletCurrent, fiatList, getAndUpdateWalletsBallance } = useContext(WalletContext);

    const defaultMaskOptions = {
        prefix: '',
        suffix: '',
        thousandsSeparatorSymbol: '',
        allowDecimal: true,
        decimalSymbol: '.',
        decimalLimit: 8,
        integerLimit: 15,
        allowNegative: false,
        allowLeadingZeroes: false,
    };
    const currencyMask = createNumberMask(defaultMaskOptions);

    const setAmountToSend = (value) => {
        const { balance, unspent } = wallets.find((wallet) => wallet.address === walletCurrent);
        if (exceeds(value, balance.unlocked)) {
            dispatch({ type: 'setAmountToSendError', payload: 'Exceeds balance' });
        } else if (value < 0.001) {
            dispatch({ type: 'setAmountToSendError', payload: 'The minimum amount to send is 0.001' });
        } else {
            calculateFee(unspent, state.messageToSend).then((fee) => dispatch({ type: 'setNetFee', payload: fee || 0 }));

            dispatch({ type: 'setAmountToSendError', payload: null });
        }
        dispatch({ type: 'setAmountToSend', payload: value });
    };

    const setAddressToSend = (value) => {
        dispatch({ type: 'setAddressToSend', payload: value });
        isAddress(value).catch(() => {
            dispatch({ type: 'setAddressToSendError', payload: true });
        });
    };
    const setMessageToSend = (value) => {
        dispatch({ type: 'setMessageToSend', payload: value });
    };

    useEffect(() => {
        dispatch({ type: 'clearState' });
    }, [walletCurrent]);

    function submitSendAmount() {
        dispatch({ type: 'setTXIDLoading', payload: true });
        createAndSendRawTransaction(
            state.addressToSend,
            Number(state.amountToSend.toFixed(8)),
            getPrivateKey(),
            state.messageToSend
        )
            .then((data) => {
                dispatch({ type: 'clearState' });
                // updateWalletsBalance();
                getAndUpdateWalletsBallance();
                dispatch({ type: 'setTXID', payload: data?.txid });
            })
            .catch((error) => dispatch({ type: 'setTXIDError', payload: error[0]?.message }))
            .finally(() => dispatch({ type: 'setTXIDLoading', payload: false }));
    }

    function handleSelectedFiat(e) {
        const { value } = e.target;
        dispatch({ type: 'setSelectedFiat', payload: value });
    }

    function isSmartFiat() {
        return state.selectedFiat === 'smart';
    }

    async function calcSendFounds(percentage) {
        const wallet = wallets.find((wallet) => wallet.address === walletCurrent);
        const balance = Number(wallet.balance.unlocked * percentage);
        const fee = await calculateFee(wallet.unspent, state.messageToSend);
        const amountToSend = subtractFloats(balance, fee);
        dispatch({ type: 'setAmountToSendError', payload: null });
        dispatch({ type: 'setNetFee', payload: fee });
        dispatch({ type: 'setAmountToSend', payload: amountToSend });
    }

    function getPrivateKey() {
        const wallet = wallets.find((wallet) => wallet.address === walletCurrent);
        return wallet?.privateKey;
    }

    function canSend() {
        return state.amountToSendError === null && state.addressToSendError === false && !state.TXIDLoading;
    }

    const totalInSmart = sumFloatsValues(state.amountToSend, state.netFee);

    const clearTxId = () => dispatch({ type: 'setTXID', payload: null });

    const providerValue = {
        ...state,
        wallets,
        walletCurrent,
        walletCurrentBalance: wallets.find((wallet) => wallet.address === walletCurrent)?.balance.unlocked,
        fiatList,
        currencyMask,
        setAmountToSend,
        setAddressToSend,
        setMessageToSend,
        submitSendAmount,
        handleSelectedFiat,
        isSmartFiat,
        calcSendFounds,
        canSend,
        totalInSmart,
        clearTxId,
    };

    return <SendContext.Provider value={providerValue}>{children}</SendContext.Provider>;
};
