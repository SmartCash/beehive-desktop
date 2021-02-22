import React, { useContext, useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Page from '../../components/Page';
import { WalletContext } from '../../context/WalletContext';
import {
    getTransactionHistoryGroupedByAddresses,
    createAndSendRawTransaction,
    getSpendableInputs,
    getSpendableBalance,
    calculateFee,
} from '../../lib/sapi';
import './Chat.css';
import { NewChat } from './NewChat';

export function Chat() {
    const { walletCurrent, wallets } = useContext(WalletContext);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState();
    const [loading, setLoading] = useState();
    const [initialLoading, setInitialLoading] = useState();
    const [currentChatAddress, setCurrentChatAddress] = useState();
    const [newChat, setNewChat] = useState(false);
    const [messageToSend, setMessageToSend] = useState('');

    async function _getTransactionHistory() {
        setLoading(true);
        setInitialLoading(true);
        setError(null);
        await getTransactionHistoryGroupedByAddresses(walletCurrent)
            .then((data) => {
                setHistory(data);
                if (data.length > 0 && newChat === false && currentChatAddress === undefined) {
                    setCurrentChatAddress(data[0].chatAddress);
                }
            })
            .catch(() => setError('There is no chat for this wallet'))
            .finally(() => {
                setLoading(false);
                setInitialLoading(false);
            });
    }

    function getChat() {
        return history?.find((chat) => chat.chatAddress === currentChatAddress);
    }

    function handleSetCurrentChatAddress(chatAddress) {
        setNewChat(false);
        setCurrentChatAddress(chatAddress);
    }

    function handleSetNewChat() {
        setNewChat(true);
        setCurrentChatAddress(null);
    }

    const handleSubmitSendAmount = async () => {
        setLoading(true);
        setInitialLoading(true);
        setError(null);
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
            alert('Message sent!');
            setMessageToSend('');
        } else {
            alert('Error');
            setError('One error happened. Try again in a moment.');
        }
        _getTransactionHistory();
        setLoading(false);
        setInitialLoading(false);
    };

    useEffect(() => {
        _getTransactionHistory();
        setTimeout(() => _getTransactionHistory(), 10000);
    }, [walletCurrent]);

    return (
        <Page className="page-chat">
            <div className="chat-wallets">
                <div className="header">
                    <span className="title">Chats</span>
                    <button onClick={handleSetNewChat}>Start chat</button>
                </div>
                {error && <p className="error">{error}</p>}
                <Scrollbars>
                    {initialLoading && (
                        <p className="error">
                            <img src="../../assets/images/loader.gif" />
                        </p>
                    )}
                    {history?.map((tx) => {
                        console.log(tx);
                        if (tx.chatAddress !== 'undefined') {
                            return (
                                <div
                                    className={`wallet ${tx.chatAddress === currentChatAddress ? 'active' : ''}`}
                                    key={tx.chatAddress}
                                    onClick={() => handleSetCurrentChatAddress(tx.chatAddress)}
                                >
                                    <p className="address">{tx.chatAddress}</p>
                                    <p className="lastMessage">
                                        {tx.messages[tx.messages.length - 1].message != undefined
                                            ? tx.messages[tx.messages.length - 1].message.substring(0, 30)
                                            : ''}
                                    </p>
                                </div>
                            );
                        }
                    })}
                </Scrollbars>
            </div>

            <div className="chat-messages">
                <input type="hidden" value={getChat()?.chatAddress} id="chatAddress" />
                <div className="transaction chatAddress">
                    <p className="label">Chat Address</p>
                    <p className="value">{getChat()?.chatAddress}</p>
                </div>
                <Scrollbars>
                    {initialLoading && (
                        <p className="error">
                            <img src="../../assets/images/loader.gif" />
                        </p>
                    )}
                    {!initialLoading &&
                        getChat()?.messages.map((m) => {
                            return (
                                <div className={`transaction message message-${m.direction}`} key={m.time}>
                                    <p className="value">{m.message}</p>
                                    <p className="label">{new Date(m.time * 1000).toLocaleString()}</p>
                                </div>
                            );
                        })}
                </Scrollbars>
                <div className="send-wrapper">
                    <textarea
                        id="messageTo"
                        className="send-input"
                        placeholder="Type a message..."
                        autoComplete="off"
                        type="text"
                        value={messageToSend}
                        onInput={(event) => {
                            setMessageToSend(event.target.value);
                        }}
                    />
                    <button className="btn send-button" onClick={() => handleSubmitSendAmount()}>
                        Send
                    </button>
                </div>
            </div>
            {!initialLoading && newChat && <NewChat />}
        </Page>
    );
}
