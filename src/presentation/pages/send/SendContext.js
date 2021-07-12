import { WalletContext } from 'application/context/WalletContext';
import { exceeds, subtractFloats, sumFloatsValues } from 'application/lib/math';
import { calculateFee, createAndSendRawTransaction, getSpendableInputs } from 'application/lib/sapi';
import { isAddress } from 'application/lib/smart';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

const initialValue = {
    amountToSend: 0,
    selectedFiat: 'smart',
    messageToSend: '',
    listUnspent: null,
    TXIDLoading: false,
};

const sendReducer = (state, action) => {
    switch (action.type) {
        case 'setAmountToSend': {
            return { ...state, amountToSend: action.payload };
        }
        case 'setMessageToSend': {
            return { ...state, messageToSend: action.payload };
        }
        case 'setListUnspent': {
            return { ...state, setListUnspent: action.payload };
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
        dispatch({ type: 'setAmountToSend', payload: value });
    };

    const checkAmounToSendError = async (value) => {
        dispatch({ type: 'setAmountToSendError', payload: '' });

        const { balance } = wallets.find((wallet) => wallet.address === walletCurrent);

        if (value < 0.001) {
            dispatch({ type: 'setAmountToSendError', payload: 'The minimum amount to send is 0.001' });
        }

        // You must get the latest unspent from the NODE
        const unspent = await getSpendableInputs(walletCurrent);

        var total = 0;
        const fee = await calculateFee(unspent.utxos, state.messageToSend);

        if (fee != undefined) {
            total = sumFloatsValues(value, fee);
            dispatch({ type: 'setNetFee', payload: fee || 0 });
        }

        if (exceeds(total, balance.unlocked)) {
            dispatch({ type: 'setAmountToSendError', payload: 'Exceeds balance' });
        } else {
            dispatch({ type: 'setAmountToSendError', payload: null });
        }
    };

    const setListUnspent = (value) => {
        dispatch({ type: 'setListUnspent', payload: value });
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

    async function submitSendAmount(password) {
        dispatch({ type: 'setTXIDLoading', payload: true });
        const { balance } = wallets.find((wallet) => wallet.address === walletCurrent);

        // You must get the latest unspent from the NODE
        const unspent = await getSpendableInputs(walletCurrent);

        createAndSendRawTransaction({
            toAddress: state.addressToSend,
            amount: Number(Number(state.amountToSend).toFixed(8)),
            privateKey: getPrivateKey(),
            messageOpReturn: state.messageToSend,
            unspentList: unspent,
            fee: state.netFee,
            unlockedBalance: balance.unlocked,
            password: password,
        })
            .then((data) => {
                if (!data) {
                    dispatch({ type: 'setTXIDError', payload: 'Something wrong with trying to send the transaction' });
                }

                if (data && data.status === 400) {
                    dispatch({ type: 'setTXIDError', payload: data.value });
                }

                if (data && data.status === 200) {
                    dispatch({ type: 'clearState' });
                    dispatch({ type: 'setTXID', payload: data?.value });
                    dispatch({ type: 'setTXIDError', payload: null });
                    getAndUpdateWalletsBallance(wallets);
                }
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

    async function calculateSendAll(percentage) {
        const wallet = wallets.find((wallet) => wallet.address === walletCurrent);
        const balance = Number(wallet.balance.unlocked * percentage);
        const unspent = await getSpendableInputs(walletCurrent);
        const fee = await calculateFee(unspent.utxos, state.messageToSend);
        const amountToSend = subtractFloats(balance, fee);

        dispatch({ type: 'setAmountToSendError', payload: null });
        dispatch({ type: 'setNetFee', payload: fee });
        dispatch({ type: 'setAmountToSend', payload: amountToSend });
    }

    async function calculateSendAmount(messageOpReturn) {
        const wallet = wallets.find((wallet) => wallet.address === walletCurrent);

        let spendableInputs = wallet?.unspent;
        if (!wallet?.unspent?.utxos || wallet?.unspent?.utxos?.length === 0) {
            spendableInputs = await getSpendableInputs(walletCurrent);
        }

        const fee = await calculateFee(spendableInputs.utxos, messageOpReturn);

        dispatch({ type: 'setAmountToSendError', payload: null });
        dispatch({ type: 'setNetFee', payload: fee });
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
        walletCurrentBalance: wallets.find((wallet) => wallet.address === walletCurrent)?.balance,
        fiatList,
        currencyMask,
        setAmountToSend,
        checkAmounToSendError,
        setAddressToSend,
        setMessageToSend,
        submitSendAmount,
        handleSelectedFiat,
        isSmartFiat,
        calculateSendAll,
        calculateSendAmount,
        canSend,
        totalInSmart,
        clearTxId,
    };

    return <SendContext.Provider value={providerValue}>{children}</SendContext.Provider>;
};
