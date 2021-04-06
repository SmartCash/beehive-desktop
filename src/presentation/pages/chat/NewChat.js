import React, { useContext } from 'react';
import './NewChat.css';
import { WalletContext } from 'application/context/WalletContext';
import { useChatController } from './Chat.controller';
import { useChatState } from './Chat.context';

export function NewChat() {
    const { addressNewChatToSend, localPassword } = useChatState();
    const { password } = useContext(WalletContext);

    const { setAddressNewChatToSend, handleSubmitSendNewChat, hasBalance } = useChatController();

    const canSendNewChat = () => {
        return addressNewChatToSend !== '' && hasBalance();
    };

    function getPass(){
        if(localPassword !== '' && localPassword !== null)
            return localPassword
        else
            return password
    }

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
                <div>
                    {!hasBalance() && (
                        <p className="errorBalance">You don't have balance to send messages, please make a deposit in your wallet.</p>
                    )}
                    </div>

                <div className="address-form">
                   
                  <button
                        className="btn send-button"
                        onClick={() => handleSubmitSendNewChat(addressNewChatToSend, getPass())}
                        disabled={!canSendNewChat()}
                    >
                        Invite
                    </button>
                </div>
            </div>
        </div>
    );
}
