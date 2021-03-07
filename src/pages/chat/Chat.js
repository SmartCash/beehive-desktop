import React, { useContext, useEffect, useRef, useState } from 'react';
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
    const [password, setPassword] = useState('');
    const { walletCurrent } = useContext(WalletContext);
    const { history, error, initialLoading, currentChatAddress, newChat, messageToSend } = useChatState();
    const messagesRef = useRef();
    const {
        _getTransactionHistory,
        handleSetCurrentChatAddress,
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
        const timer = setInterval(() => _getTransactionHistory(), 60000);
        return () => clearInterval(timer);
    }, [walletCurrent]);

    useEffect(() => {
        console.log(messagesRef.current);
    }, [messagesRef])

    return (
        <Page className="page-chat">
            <div className="chat-wallets">
                <div className="header">
                    <span className="title">Chats</span>
                    {/* <button onClick={handleSetNewChat}>Start chat</button> */}
                    <button onClick={() => _getTransactionHistory()}>Refresh</button>
                </div>
                {error && <p className="error">{error}</p>}
                <Scrollbars renderThumbVertical={props => < div {...props} className="thumb-vertical"/>}>
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
                    <Scrollbars ref={messagesRef} renderThumbVertical={props => < div {...props} className="thumb-vertical"/>}>
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
                        <div className="message-wrap">
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
                        </div>
                        <div className="password-wrap">
                            <input
                                placeholder="Insert your password"
                                className="send-input"
                                type="password"
                                value={password}
                                onInput={(event) => {
                                    setPassword(event.target.value);
                                }}
                            />
                        </div>
                        <div className="">
                            <button
                                className="btn send-button"
                                onClick={() => handleSubmitSendAmount(currentChatAddress, messageToSend, password)}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!initialLoading && newChat && <NewChat />}
        </Page>
    );
}
