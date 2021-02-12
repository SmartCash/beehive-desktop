import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

export function ChatMessages(props) {
    const { chat } = props;
    return (
        <div className="chat-messages">
            <div className="transaction chatAddress">
                <p className="label">Chat Address</p>
                <p className="value">{chat?.chatAddress}</p>
            </div>
            <Scrollbars>
                {chat?.messages
                    .map((m) => {
                        return (
                            <div className={`transaction message message-${m.direction}`} key={m.time}>
                                <p className="value">{m.message}</p>
                                <p className="label">{new Date(m.time * 1000).toLocaleString()}</p>
                            </div>
                        );
                    })}
            </Scrollbars>
            <div className="send-wrapper">
                <textarea placeholder="Type a message..." className="send-input" />
                <button className="btn send-button">Send</button>
            </div>
        </div>
    );
}
