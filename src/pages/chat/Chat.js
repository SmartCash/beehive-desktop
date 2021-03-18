import React, { useContext, useEffect, useRef, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Page from '../../components/Page';
import { WalletContext } from '../../context/WalletContext';
import './Chat.css';
import { NewChat } from './NewChat';
import loader from '../../assets/images/loader.svg';
import { ChatProvider, useChatState, clearTxId } from './Chat.context';
import { useChatController } from './Chat.controller';

export function Chat() {
    return (
        <ChatProvider>
            <ChatComponent />
        </ChatProvider>
    );
}

function ChatComponent() {
    const { walletCurrent } = useContext(WalletContext);
    const { history, error, initialLoading, currentChatAddress, newChat, messageToSend, password, TXID } = useChatState();
    const messagesRef = useRef();
    const {
        _getTransactionHistory,
        handleSetCurrentChatAddress,
        handleSubmitSendAmount,
        handleSetNewChat,
        clearState,
        clearTXID,
        setMessageToSend,
        setPasswordToSend,
        generateMessage
    } = useChatController();

    const getChat = () => {
        return history?.find((chat) => chat.chatAddress === currentChatAddress);
    };

    const canSend = () => {
        return password !== '' && messageToSend !== ''
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
                    {<button onClick={handleSetNewChat}>Start chat</button>}
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
                                        {
                                            generateMessage(tx.messages)
                                        }                                      
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
                    {error && (<p className="ChatError">{error}</p>)}

                    {TXID && (
                         <div className="hasBeenSent">
                         <button className="btnClose"  onClick={() => clearTXID()}>
                             X
                         </button>
                         <p><strong>Message has been sent</strong></p>         
                         <p>Transaction ID: <strong class="txID"> {TXID} </strong></p>
                         <p>it may take up to a minute for your message to appear.</p>
                     </div>
                    )}                   
                
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
                                if(getChat()?.messages.length == 1){
                                    return (
                                        <div className="accept">
                                            <button className="acceptInvite">Accept invite</button>
                                        </div>
                                    );
                                } else {
                                    if(!m.message.includes('-----BEGIN PUBLIC KEY-----')){                                        
                                        return (
                                            <div className={`transaction message message-${m.direction}`} key={m.time}>
                                                <p className="value">{m.message}</p>
                                                <p className="label">{m.direction} at {new Date(m.time * 1000).toLocaleString()}</p>
                                            </div>
                                        );
                                    } 
                                }                                                          
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
                                    setPasswordToSend(event.target.value);
                                }}
                            />
                        </div>
                        <div className="">
                            <button
                                className="btn send-button"
                                onClick={() => handleSubmitSendAmount(currentChatAddress, messageToSend, password)}
                                disabled={!canSend()}
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
