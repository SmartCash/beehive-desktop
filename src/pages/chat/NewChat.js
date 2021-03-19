import React from 'react';
import './NewChat.css';
import { useChatController } from './Chat.controller';
import { useChatState } from './Chat.context';

export function NewChat() {
    const { passwordNewChat, addressNewChatToSend } = useChatState();

    const { setAddressNewChatToSend, setPasswordNewChatToSend, handleSubmitSendNewChat } = useChatController();

    const canSendNewChat = () => {
        return passwordNewChat !== '' && addressNewChatToSend !== '';
    };

    return (
        <div className="page-new-chat">
            <div className="page-content">
                <p className="title">New chat</p>
                <p className="subtitle">Enter the wallet address to start a new chat</p>
                <div className="address-form">
                    <textarea
                        className="send-input"
                        autoFocus
                        rows="3"
                        cols="10"
                        placeholder="Contact wallet address"
                        value={addressNewChatToSend}
                        onInput={(event) => {
                            setAddressNewChatToSend(event.target.value);
                        }}
                    />
                </div>
                <div className="address-form">
                    <input
                        placeholder="Insert your password"
                        className="send-input"
                        type="password"
                        value={passwordNewChat}
                        onInput={(event) => {
                            setPasswordNewChatToSend(event.target.value);
                        }}
                    />
                </div>
                <div className="address-form">
                    <button
                        className="btn send-button"
                        onClick={() => handleSubmitSendNewChat(addressNewChatToSend, passwordNewChat)}
                        disabled={!canSendNewChat()}
                    >
                        Invite
                    </button>
                </div>
            </div>
        </div>
    );
}
