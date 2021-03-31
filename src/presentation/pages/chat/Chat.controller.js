import { WalletContext } from 'application/context/WalletContext';
import {
    calculateFee,
    getSpendableBalance,
    getSpendableInputs,
    getTransactionHistoryGroupedByAddresses,
} from 'application/lib/sapi';
import { createAndSendRawTransaction } from 'application/lib/sapi';
import { useContext } from 'react';
import { ACTION_TYPE, useChatDispatch } from './Chat.context';

export const useChatController = () => {
    const { walletCurrent, wallets, history } = useContext(WalletContext);
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

    const handleSubmitSendAmount = async (currentChatAddress, messageToSend, password, rsaPublicKeyRecipient) => {
        chatDispatch({ type: ACTION_TYPE.loading, payload: true });
        chatDispatch({ type: ACTION_TYPE.initialLoading, payload: true });
        chatDispatch({ type: ACTION_TYPE.error, payload: null });

        try {
            const spendableInputs = await getSpendableInputs(walletCurrent);
            const transaction = await createAndSendRawTransaction({
                toAddress: currentChatAddress,
                amount: 0.001,
                fee: await calculateFee(spendableInputs.utxos, messageToSend),
                messageOpReturn: messageToSend,
                password: password,
                unspentList: spendableInputs,
                unlockedBalance: await getSpendableBalance(walletCurrent, spendableInputs),
                privateKey: wallets.find((w) => w.address === walletCurrent).privateKey,
                isChat: true,
                rsaKeyPairFromSender: wallets.find((w) => w.address === walletCurrent).RSA,
                rsaKeyPairFromRecipient: { rsaPublicKey: rsaPublicKeyRecipient },
            });

            if (transaction.status === 200) {
                chatDispatch({ type: ACTION_TYPE.messageToSend, payload: '' });
                chatDispatch({ type: ACTION_TYPE.success, payload: transaction.value });
                chatDispatch({ type: ACTION_TYPE.error, payload: null });
            } else {
                chatDispatch({ type: ACTION_TYPE.error, payload: 'One error happened. Try again in a moment.' });
            }
            _getTransactionHistory();
            chatDispatch({ type: ACTION_TYPE.loading, payload: false });
            chatDispatch({ type: ACTION_TYPE.initialLoading, payload: false });

            chatDispatch({ type: ACTION_TYPE.newChat, payload: false });
        } catch (error) {
            chatDispatch({ type: ACTION_TYPE.error, payload: 'One error happened. Try again in a moment.' });
        }
    };

    const handleSubmitSendNewChat = async (addressNewChatToSend, passwordNewChat, rsaPublicKeyRecipient) => {
        chatDispatch({ type: ACTION_TYPE.loading, payload: true });
        chatDispatch({ type: ACTION_TYPE.initialLoading, payload: true });
        chatDispatch({ type: ACTION_TYPE.error, payload: null });

        try {
            const spendableInputs = await getSpendableInputs(walletCurrent);
            var messageToSend = wallets.find((w) => w.address === walletCurrent).RSA.rsaPublicKey;

            const transaction = await createAndSendRawTransaction({
                toAddress: addressNewChatToSend,
                amount: 0.001,
                fee: await calculateFee(spendableInputs.utxos, messageToSend),
                messageOpReturn: messageToSend,
                password: passwordNewChat,
                unspentList: spendableInputs,
                unlockedBalance: await getSpendableBalance(walletCurrent, spendableInputs),
                privateKey: wallets.find((w) => w.address === walletCurrent).privateKey,
                isChat: true,
                rsaKeyPairFromSender: wallets.find((w) => w.address === walletCurrent).RSA,
                rsaKeyPairFromRecipient: { rsaPublicKey: rsaPublicKeyRecipient },
            });

            console.log(transaction);

            if (transaction.status === 200) {
                chatDispatch({ type: ACTION_TYPE.messageToSend, payload: '' });
                chatDispatch({ type: ACTION_TYPE.success, payload: transaction.value });
                chatDispatch({ type: ACTION_TYPE.error, payload: null });

                chatDispatch({ type: ACTION_TYPE.addressNewChatToSend, payload: '' });
                chatDispatch({ type: ACTION_TYPE.password, payload: '' });
            } else {
                chatDispatch({ type: ACTION_TYPE.error, payload: 'One error happened. Try again in a moment.' });
            }

            _getTransactionHistory();
            chatDispatch({ type: ACTION_TYPE.loading, payload: false });
            chatDispatch({ type: ACTION_TYPE.initialLoading, payload: false });
            chatDispatch({ type: ACTION_TYPE.newChat, payload: false });
        } catch (error) {
            chatDispatch({ type: ACTION_TYPE.error, payload: 'One error happened. Try again in a moment.' });
        }
    };

    async function handleAcceptChat(addressToSend, passwordAcceptChat) {
        chatDispatch({ type: ACTION_TYPE.loading, payload: true });
        chatDispatch({ type: ACTION_TYPE.initialLoading, payload: true });
        chatDispatch({ type: ACTION_TYPE.error, payload: null });

        try {
            const spendableInputs = await getSpendableInputs(walletCurrent);
            var messageToSend = wallets.find((w) => w.address === walletCurrent).RSA.rsaPublicKey;

            const transaction = await createAndSendRawTransaction({
                toAddress: addressToSend,
                amount: 0.001,
                fee: await calculateFee(spendableInputs.utxos, messageToSend),
                messageOpReturn: messageToSend,
                password: passwordAcceptChat,
                unspentList: spendableInputs,
                unlockedBalance: await getSpendableBalance(walletCurrent, spendableInputs),
                privateKey: wallets.find((w) => w.address === walletCurrent).privateKey,
                isChat: true,
            });

            if (transaction.status === 200) {
                chatDispatch({ type: ACTION_TYPE.messageToSend, payload: '' });
                chatDispatch({ type: ACTION_TYPE.success, payload: transaction.value });
                chatDispatch({ type: ACTION_TYPE.error, payload: null });

                chatDispatch({ type: ACTION_TYPE.addressNewChatToSend, payload: '' });
                chatDispatch({ type: ACTION_TYPE.password, payload: '' });
                chatDispatch({ type: ACTION_TYPE.passwordAcceptChat, payload: '' });
            } else {
                chatDispatch({ type: ACTION_TYPE.error, payload: 'One error happened. Try again in a moment.' });
            }

            _getTransactionHistory();
            chatDispatch({ type: ACTION_TYPE.loading, payload: false });
            chatDispatch({ type: ACTION_TYPE.initialLoading, payload: false });
            chatDispatch({ type: ACTION_TYPE.newChat, payload: false });
        } catch (error) {
            chatDispatch({ type: ACTION_TYPE.error, payload: 'One error happened. Try again in a moment.' });
        }
    }

    function clearState() {
        chatDispatch({ type: ACTION_TYPE.clearState });
    }

    function clearTXID() {
        chatDispatch({ type: ACTION_TYPE.success, payload: '' });
    }

    function setMessageToSend(message) {
        chatDispatch({ type: ACTION_TYPE.messageToSend, payload: message });
    }

    function setPasswordToSend(pass) {
        chatDispatch({ type: ACTION_TYPE.password, payload: pass });
    }

    function setAddressNewChatToSend(message) {
        chatDispatch({ type: ACTION_TYPE.addressNewChatToSend, payload: message });
    }

    function setPasswordAcceptChat(pass) {
        chatDispatch({ type: ACTION_TYPE.passwordAcceptChat, payload: pass });
    }

    function setPasswordNewChatToSend(pass) {
        chatDispatch({ type: ACTION_TYPE.passwordNewChat, payload: pass });
    }

    function generateMessage(messages) {
        var removePublicKeys = [];

        messages.forEach((item) => {
            if (!item.message.includes('-----BEGIN PUBLIC KEY-----')) {
                removePublicKeys.push(item);
            }
        });

        if (removePublicKeys.length > 0) return removePublicKeys[removePublicKeys.length - 1].message.substring(0, 30);
        else return '';
    }

    function isNewWallet(chat) {
        return chat === undefined;
    }

    return {
        _getTransactionHistory,
        handleSetCurrentChatAddress,
        handleSetNewChat,
        handleAcceptChat,
        handleSubmitSendAmount,
        handleSubmitSendNewChat,
        clearState,
        clearTXID,
        setMessageToSend,
        setPasswordToSend,
        setAddressNewChatToSend,
        setPasswordNewChatToSend,
        setPasswordAcceptChat,
        generateMessage,
        isNewWallet,
    };
};
