import React, { useContext, useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Page from '../../components/Page';
import { WalletContext } from '../../context/WalletContext';
import { getTransactionHistoryGroupedByAddresses } from '../../lib/sapi';
import './Chat.css';
import { ChatMessages } from './ChatMessages';
import { NewChat } from './NewChat';

export function Chat() {
    const { walletCurrent, wallets } = useContext(WalletContext);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState();
    const [loading, setLoading] = useState();
    const [initialLoading, setInitialLoading] = useState();
    const [currentChatAddress, setCurrentChatAddress] = useState();
    const [newChat, setNewChat] = useState(false);

    async function _getTransactionHistory() {
        setLoading(true);
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

    useEffect(() => {
        setInitialLoading(true);
        _getTransactionHistory();
        // setTimeout(() => _getTransactionHistory(), 60000);
    }, [walletCurrent]);

    return (
        <Page className="page-chat">
            <div className="chat-wallets">
                <div className="header">
                    <span className="title">Chats</span>
                    <button onClick={handleSetNewChat}>Start chat</button>
                </div>
                {initialLoading && <p className="error">Loading conversations</p>}
                {error && <p className="error">{error}</p>}
                {!initialLoading && (
                    <Scrollbars>
                        {history?.map((tx) => {
                            console.log(tx);
                            if(tx.chatAddress !== 'undefined'){
                                return (
                                    <div
                                        className={`wallet ${tx.chatAddress === currentChatAddress ? 'active' : ''}`}
                                        key={tx.chatAddress}
                                        onClick={() => handleSetCurrentChatAddress(tx.chatAddress)}
                                    >
                                        <p className="address">{tx.chatAddress}</p>
                                        <p className="lastMessage">{tx.messages[tx.messages.length - 1].message != undefined ? tx.messages[tx.messages.length - 1].message.substring(0,30) : ''}</p>
                                    </div>
                                );
                            }                           
                        })}
                    </Scrollbars>
                )}
            </div>
            {!initialLoading && !newChat && currentChatAddress && (
                <ChatMessages
                    chat={getChat()}
                    chatAddress={currentChatAddress}
                    walletCurrent={walletCurrent}
                    wallet={wallets.find((w) => w.address === walletCurrent)}
                />
            )}
            {!initialLoading && newChat && <NewChat />}
        </Page>
    );
}
