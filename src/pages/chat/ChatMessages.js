import React, { useContext, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { createAndSendRawTransaction, getSpendableInputs, getSpendableBalance, calculateFee } from './../../lib/sapi';

export function ChatMessages(props) {
    const { chat } = props;
    const [messageToSend, setMessageToSend] = useState('');

    const handleSubmitSendAmount = async () => {
        const spendableInputs = await getSpendableInputs(props.walletCurrent);
        const transaction = await createAndSendRawTransaction({
            toAddress: props.chatAddress,
            amount: 0.001,
            fee: await calculateFee(spendableInputs.utxos, messageToSend),
            messageOpReturn: messageToSend,
            password: '123456',
            unspentList: spendableInputs,
            unlockedBalance: await getSpendableBalance(props.walletCurrent),
            privateKey: props.wallet.privateKey,
        });

        if (transaction.status === 200) {
            alert('Message sent!');
            setMessageToSend('');
        } else {
            alert('Error');
        }

        console.log(transaction);
    };

    return (
        <div className="chat-messages">
            <input type="hidden" value={chat?.chatAddress} id="chatAddress" />
            <div className="transaction chatAddress">
                <p className="label">Chat Address</p>
                <p className="value">{chat?.chatAddress}</p>
            </div>
            <Scrollbars>
                {chat?.messages.map((m) => {
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
    );
}
