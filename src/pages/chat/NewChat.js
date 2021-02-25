import React from 'react';
import './NewChat.css';

export function NewChat() {
    return (
        <div className="page-new-chat">
            <div className="page-content">
                <p className="title">New chat</p>
                <p className="subtitle">Enter the wallet address to start a new chat</p>
                <div className="address-form">
                    <input autoFocus placeholder="Contact wallet address" />
                </div>
                <div className="address-form">
                    <input autoFocus placeholder="Your password" />
                </div>
                <div className="address-form">
                    <button>Invite</button>
                </div>
            </div>
        </div>
    );
}
