import { WalletContext } from 'application/context/WalletContext';
import useModal from 'application/hooks/useModal';
import { decryptTextWithRSAPrivateKey } from 'application/lib/sapi';
import loader from 'presentation/assets/images/loader.svg';
import Page from 'presentation/components/Page';
import { PasswordModal } from 'presentation/components/password-modal/passsword-modal';
import React, { useContext, useEffect, useRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { ChatProvider, useChatState } from './Chat.context';
import { useChatController } from './Chat.controller';
import './Chat.css';
import { NewChat } from './NewChat';

export function Chat() {
    return (
        <ChatProvider>
            <ChatComponent />
        </ChatProvider>
    );
}

function ChatComponent() {
    const { isShowing: showPasswordModal, toggle: togglePasswordModal } = useModal();
    const { walletCurrent, wallets, password, setPassword } = useContext(WalletContext);
    const {
        history,
        error,
        initialLoading,
        currentChatAddress,
        newChat,
        messageToSend,
        TXID,
        passwordAcceptChat,
        localPassword
    } = useChatState();
    const messagesRef = useRef();
    const {
        _getTransactionHistory,
        handleSetCurrentChatAddress,
        handleSubmitSendAmount,
        handleSetNewChat,
        handleAcceptChat,
        clearState,
        clearTXID,
        setMessageToSend,
        setPasswordAcceptChat,
        setPasswordToSend,        
        isNewWallet
    } = useChatController();

    const getChat = () => {
        return history?.find((chat) => chat.chatAddress === currentChatAddress);
    };

    const canSendAcceptChat = () => {
        return passwordAcceptChat !== '';
    };

    const isAccept = () => {
        return getChat()?.messages.length == 1;
    };

    const canSend = () => {
        return messageToSend !== '';
    };

    function hasPass(){
        return ((localPassword !== '' && localPassword !== null) || (password !== '' && password !== null))
    }

    function getPass(){
        if(localPassword !== '' && localPassword !== null)
            return localPassword
        else
            return password
    }

    const parseMessage = (messageObject) => {
        let jsonMessage = null;
        let textMessage = null;

        try {
            jsonMessage = JSON.parse(messageObject.message);
        } catch (e) {
            textMessage = messageObject.message;
        }
        if (jsonMessage) {
            const rsaKeyPair = wallets.find((w) => w.address === walletCurrent).RSA;

            if (rsaKeyPair) {
                if (messageObject.direction === 'Sent' && messageObject.toAddress !== walletCurrent) {
                    try {
                        textMessage = decryptTextWithRSAPrivateKey(
                            rsaKeyPair.rsaPrivateKey,
                            getPass(),
                            jsonMessage.messageFromSender
                        );
                    } catch (error) {
                        textMessage = error.message;
                    }
                } else {
                    try {
                        textMessage = decryptTextWithRSAPrivateKey(
                            rsaKeyPair.rsaPrivateKey,
                            getPass(),
                            jsonMessage.messageToRecipient
                        );
                    } catch (error) {
                        textMessage = error.message;
                    }
                }
            }
        }
        return textMessage;
    };

    const handleSend = (pass, saveInContext) => {
        if(saveInContext)
            setPassword(pass);
        else
            setPasswordToSend(pass);                   
        
        togglePasswordModal();
    }    

    function generateMessage(messages) {
        var removePublicKeys = [];

        messages.forEach((item) => {
            item = parseMessage(item);

            if(item != null){
                if (!item.includes('-----BEGIN PUBLIC KEY-----')) {
                    removePublicKeys.push(item);
                }
            }           
        });

        if (removePublicKeys.length > 0) return removePublicKeys[removePublicKeys.length - 1].substring(0, 30);
        else return '';
    }

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

    return (
        <Page className="page-chat">
             {
                !hasPass() && (
                    <div className="decryptMessages">
                        <p>The messages in this chat are encrypted, please put your password to decrypt them!</p>                        
                        <button
                            className="btn send-button"
                            onClick={() => togglePasswordModal()}                                    
                        >Decrypt Messages
                        </button>
                </div>
                )
            }

            {
                hasPass() && (
                    <>
                    <div className="chat-wallets">
                    <div className="header">
                        <span className="title">Chats</span>
                        {<button onClick={handleSetNewChat}>Start chat</button>}
                        <button onClick={() => _getTransactionHistory()}>Refresh</button>
                    </div>
                    {error && <p className="error">{error}</p>}
                    <Scrollbars renderThumbVertical={(props) => <div {...props} className="thumb-vertical" />}>
                        {history?.map((tx) => {
                            if (tx.chatAddress !== 'undefined') {
                                return (
                                    <div
                                        className={`wallet ${tx.chatAddress === currentChatAddress ? 'active' : ''}`}
                                        key={tx.chatAddress}
                                        onClick={() => handleSetCurrentChatAddress(tx.chatAddress)}
                                    >
                                        <p className="address">{tx.chatAddress}</p>
                                        <p className="lastMessage">{                                            
                                            generateMessage(tx.messages)}</p>
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
    
                    {newChat === false && !isNewWallet(getChat()?.chatAddress) && (
                        <div className="chat-messages">
                            {error && <p className="ChatError">{error}</p>}
        
                            {TXID && (
                                <div className="hasBeenSent">
                                    <button className="btnClose" onClick={() => clearTXID()}>
                                        X
                                    </button>
                                    <p>
                                        <strong>Message has been sent</strong>
                                    </p>
                                    <p>
                                        Transaction ID: <strong class="txID"> {TXID} </strong>
                                    </p>
                                    <p>it may take up to a minute for your message to appear.</p>
                                </div>
                            )}
        
                            <input type="hidden" value={getChat()?.chatAddress} id="chatAddress" />
                            <div className="transaction chatAddress">
                                <p className="label">Chat Address</p>
                                <p className="value">{getChat()?.chatAddress}</p>
                            </div>
                            <Scrollbars ref={messagesRef} renderThumbVertical={(props) => <div {...props} className="thumb-vertical" />}>
                                {initialLoading && (
                                    <p className="loading">
                                        <img src={loader} alt={'loading...'} />
                                    </p>
                                )}
                                {!initialLoading &&
                                    getChat()?.messages.map((m) => {
                                        if (isAccept()) {
                                            if (m.direction == 'Sent') {
                                                if (!m.message.includes('-----BEGIN PUBLIC KEY-----')) {
                                                    return (
                                                        <div className={`transaction message message-${m.direction}`} key={m.time}>
                                                            <p className="value">{parseMessage(m)}</p>
                                                            <p className="label">
                                                                {m.direction} at {new Date(m.time * 1000).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div class="transaction chatAddress">
                                                            This chat is not accepted yet, please await for response.
                                                        </div>
                                                    );
                                                }
                                            } else {
                                                if (!m.message.includes('-----BEGIN PUBLIC KEY-----')) {
                                                    return (
                                                        <div className={`transaction message message-${m.direction}`} key={m.time}>
                                                            <p className="value">{parseMessage(m)}</p>
                                                            <p className="label">
                                                                {m.direction} at {new Date(m.time * 1000).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div className="accept">
                                                            <input
                                                                placeholder="Insert your password"
                                                                className="send-input"
                                                                type="password"
                                                                value={passwordAcceptChat}
                                                                onInput={(event) => {
                                                                    setPasswordAcceptChat(event.target.value);
                                                                }}
                                                            />
                                                            <br />
                                                            <br />
                                                            <button
                                                                onClick={() => handleAcceptChat(m.toAddress, passwordAcceptChat)}
                                                                className="acceptInvite"
                                                                disabled={!canSendAcceptChat()}
                                                            >
                                                                Accept invite
                                                            </button>
                                                        </div>
                                                    );
                                                }
        
                                            }
                                        } else {
                                            if (!m.message.includes('-----BEGIN PUBLIC KEY-----')) {
                                                return (
                                                    <div className={`transaction message message-${m.direction}`} key={m.time}>
                                                        <p className="value">{parseMessage(m)}</p>
                                                        <p className="label">
                                                            {m.direction} at {new Date(m.time * 1000).toLocaleString()}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                        }
                                    })}
                            </Scrollbars>
        
                            {isAccept() === false && (
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
                                
                                    <div className="">
                                        <button
                                            className="btn send-button"
                                            onClick={() =>
                                                handleSubmitSendAmount(
                                                    currentChatAddress,
                                                    messageToSend,
                                                    getPass(),
                                                    (getChat()?.messages.find(
                                                        (m) => m.direction !== 'Sent' && m.message.includes('-----BEGIN PUBLIC KEY-----')
                                                    )).message
                                                )
                                            }
                                            disabled={!canSend()}
                                        >Send
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
        
                    {!initialLoading && newChat && <NewChat />}
        
                    {!initialLoading && !newChat && isNewWallet(getChat()?.chatAddress) && <NewChat />}                  
                    </>
                )
            }

              {
                    showPasswordModal && (
                        <PasswordModal
                            callBack={handleSend}
                            isShowing={showPasswordModal}
                            onClose={togglePasswordModal}
                        />
                    )
                }              
        </Page>
    );
}