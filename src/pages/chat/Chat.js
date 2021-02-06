import React, { useContext, useEffect, useState } from 'react';
import Page from '../../components/Page';
import { WalletContext } from '../../context/WalletContext';
import { getTransactionHistoryGroupedByAddresses } from '../../lib/sapi';
import './Chat.css';
import { Scrollbars } from 'react-custom-scrollbars';

function Chat() {
    const { walletCurrent } = useContext(WalletContext);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState();
    const [loading, setLoading] = useState();

    async function _getTransactionHistory() {
        setLoading(true);
        setError(null);
        setHistory([]);
        await getTransactionHistoryGroupedByAddresses(walletCurrent)
            .then((data) => setHistory(data))
            .catch(() => setError('There is no chat for this wallet'))
            .finally(() => setLoading(false));
    }

    const handleGetTransactions = () => {
        _getTransactionHistory();
        setTimeout(() => _getTransactionHistory(), 60000);
    };

    useEffect(handleGetTransactions, [walletCurrent]);

    const localArray = Array.from(Array(10).keys());

    return (
        <Page className="page-chat">
            <div className="chat-wallets">
                <Scrollbars>
                    {localArray.map((item) => (
                        <div className={`wallet ${item === 1 ? 'active' : ''}`} key={item}>
                            <p className="address">SZs723CRDM5T32vYMu8CZfM45HSihYMW53</p>
                            <p className="lastMessage">Hello</p>
                        </div>
                    ))}
                </Scrollbars>
            </div>
            <div className="chat-messages">
                <div className="transaction chatAddress">
                    <p className="label">Chat Address</p>
                    <p className="value">TXID SdasdEasdASdaEasdasDfasdDRadsdD</p>
                </div>
                <Scrollbars>
                    <div className={`transaction message message-sent`}>
                        <p className="value">Message</p>
                        <p className="label">{new Date().toLocaleString()}</p>
                    </div>
                    <div className={`transaction message message-receive`}>
                        <p className="value">Lorem ipsum</p>
                        <p className="label">{new Date().toLocaleString()}</p>
                    </div>
                </Scrollbars>
                <div className="send-wrapper">
                    <textarea placeholder="Type a message..." className="send-input" />
                    <button className="btn send-button">Send</button>
                </div>
            </div>
        </Page>
    );

    return (
        <Page className="page-chat">
            {loading && <p className="error">Loading Conversations</p>}
            {error && <p className="error">{error}</p>}
            {!error && history && (
                <Scrollbars>
                    {history?.map((tx, index) => {
                        return (
                            <div className="transaction transaction-messages" key={index}>
                                <p className="label">Chat Address</p>
                                <p className="value">{tx.chatAddress}</p>
                                {tx.messages
                                    .sort((a, b) => (a.time > b.time ? 1 : -1))
                                    .map((m) => {
                                        return (
                                            <div className={`transaction message message-${m.direction}`}>
                                                <p className="label">Direction</p>
                                                <p className="value">{m.direction}</p>
                                                <p className="label">Message</p>
                                                <p className="value">{m.message}</p>
                                                <p className="label">Time</p>
                                                <p className="value">{new Date(m.time * 1000).toLocaleString()}</p>
                                            </div>
                                        );
                                    })}
                            </div>
                        );
                    })}
                </Scrollbars>
            )}
        </Page>
    );
}
export default Chat;
