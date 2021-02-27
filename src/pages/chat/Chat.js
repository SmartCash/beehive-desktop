import React, { useContext, useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Page from '../../components/Page';
import { WalletContext } from '../../context/WalletContext';
import './Chat.css';
import { NewChat } from './NewChat';
import loader from '../../assets/images/loader.svg';
import { ChatProvider, useChatState } from './Chat.context';
import { useChatController } from './Chat.controller';

export function Chat() {
    return (
        <ChatProvider>
            <ChatComponent />
        </ChatProvider>
    );
}

function ChatComponent() {
    const [timer, setTimer] = useState();
    const { walletCurrent } = useContext(WalletContext);
    const { history, error, loading, initialLoading, currentChatAddress, newChat, messageToSend } = useChatState();
    const {
        _getTransactionHistory,
        handleSetCurrentChatAddress,
        handleSetNewChat,
        handleSubmitSendAmount,
        clearState,
        setMessageToSend,
    } = useChatController();

    const getChat = () => {
        return history?.find((chat) => chat.chatAddress === currentChatAddress);
    };

    useEffect(() => {
        if (history && history.length > 0 && newChat === false && currentChatAddress === undefined) {
            handleSetCurrentChatAddress(history[0].chatAddress);
        }
    }, [history]);

    useEffect(() => {
        clearState();
        _getTransactionHistory();
        clearInterval(timer);
        setTimer(setInterval(() => _getTransactionHistory(), 60000));
        return () => {
            clearInterval(timer);
        };
    }, [walletCurrent]);

    return (
        <Page className="page-chat">
            <div className="chat-wallets">
                <div className="header">
                    <span className="title">Chats</span>
                    <button onClick={handleSetNewChat}>Start chat</button>
                    <button onClick={() => _getTransactionHistory()}>Refresh</button>
                </div>
                {error && <p className="error">{error}</p>}
                <Scrollbars>
                    {history?.map((tx) => {
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
                    {initialLoading && (
                        <p className="loading">
                            <img src={loader} alt={'loading...'} />
                        </p>
                    )}
                </Scrollbars>
            </div>

            {newChat === false && (
                <div className="chat-messages">
                    <input type="hidden" value={getChat()?.chatAddress} id="chatAddress" />
                    <div className="transaction chatAddress">
                        <p className="label">Chat Address</p>
                        <p className="value">{getChat()?.chatAddress}</p>
                    </div>
                    <Scrollbars>
                        {initialLoading && (
                            <p className="loading">
                                <img src={loader} alt={'loading...'} />
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
                        <button
                            className="btn send-button"
                            onClick={() => handleSubmitSendAmount(currentChatAddress, messageToSend)}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
            
            {!initialLoading && newChat && <NewChat />}
        </Page>
    );
}
