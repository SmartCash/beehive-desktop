import { useContext } from 'react';
import {
    getTransactionHistoryGroupedByAddresses,
    createAndSendRawTransaction,
    getSpendableInputs,
    getSpendableBalance,
    calculateFee,
} from '../../lib/sapi';
import { WalletContext } from '../../context/WalletContext';
import { useChatDispatch, ACTION_TYPE } from './Chat.context';

export const useChatController = () => {
    const { walletCurrent, wallets } = useContext(WalletContext);
    const chatDispatch = useChatDispatch();

    async function _getTransactionHistory() {
        chatDispatch({ type: ACTION_TYPE.loading, payload: true });
        chatDispatch({ type: ACTION_TYPE.initialLoading, payload: true });
        chatDispatch({ type: ACTION_TYPE.error, payload: null });
        await getTransactionHistoryGroupedByAddresses(walletCurrent)
            .then((data) => {
                chatDispatch({ type: ACTION_TYPE.history, payload: data });
            })
            .catch(() => chatDispatch({ type: ACTION_TYPE.error, payload: 'There is no chat for this wallet' }))
            .finally(() => {
                chatDispatch({ type: ACTION_TYPE.loading, payload: false });
                chatDispatch({ type: ACTION_TYPE.initialLoading, payload: false });
            });
    }

    function handleSetCurrentChatAddress(chatAddress) {
        chatDispatch({ type: ACTION_TYPE.newChat, payload: false });
        chatDispatch({ type: ACTION_TYPE.currentChatAddress, payload: chatAddress });
    }

    function handleSetNewChat() {
        chatDispatch({ type: ACTION_TYPE.newChat, payload: true });
        chatDispatch({ type: ACTION_TYPE.currentChatAddress, payload: null });
    }

    const handleSubmitSendAmount = async (currentChatAddress, messageToSend) => {
        chatDispatch({ type: ACTION_TYPE.loading, payload: true });
        chatDispatch({ type: ACTION_TYPE.initialLoading, payload: true });
        chatDispatch({ type: ACTION_TYPE.error, payload: null });
        const spendableInputs = await getSpendableInputs(walletCurrent);
        const transaction = await createAndSendRawTransaction({
            toAddress: currentChatAddress,
            amount: 0.001,
            fee: await calculateFee(spendableInputs.utxos, messageToSend),
            messageOpReturn: messageToSend,
            password: '123456',
            unspentList: spendableInputs,
            unlockedBalance: await getSpendableBalance(walletCurrent),
            privateKey: wallets.find((w) => w.address === walletCurrent).privateKey,
        });

        if (transaction.status === 200) {
            chatDispatch({ type: ACTION_TYPE.messageToSend, payload: '' });
        } else {
            chatDispatch({ type: ACTION_TYPE.error, payload: 'One error happened. Try again in a moment.' });
        }
        _getTransactionHistory();
        chatDispatch({ type: ACTION_TYPE.loading, payload: false });
        chatDispatch({ type: ACTION_TYPE.initialLoading, payload: false });
    };

    function clearState() {
        chatDispatch({ type: ACTION_TYPE.clearState });
    }

    function setMessageToSend(message) {
        chatDispatch({ type: ACTION_TYPE.messageToSend, payload: message });
    }

    return {
        _getTransactionHistory,
        handleSetCurrentChatAddress,
        handleSetNewChat,
        handleSubmitSendAmount,
        clearState,
        setMessageToSend,
    };
};
