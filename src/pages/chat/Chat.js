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
    const [_tx, setTx] = useState();

    async function _getTransactionHistory() {
        setLoading(true);
        setError(null);
        setHistory([]);
        await getTransactionHistoryGroupedByAddresses(walletCurrent)
            .then((data) => {
                setHistory(data);
                setTx(data[0]);
            })
            .catch(() => setError('There is no chat for this wallet'))
            .finally(() => setLoading(false));
    }

    const handleGetTransactions = () => {
        _getTransactionHistory();
        setTimeout(() => _getTransactionHistory(), 60000);
    };

    useEffect(handleGetTransactions, [walletCurrent]);

    return (
        <Page className="page-chat">
            <div className="chat-wallets">
                <div className="header">
                    <span className="title">Chat</span>
                    <button>Start Chat</button>
                </div>
                {loading && <p className="error">Loading Conversations</p>}
                {error && <p className="error">{error}</p>}
                <Scrollbars>
                    {history &&
                        history?.map((tx, index) => {
                            return (
                                <div className={`wallet ${tx.chatAddress === _tx?.chatAddress} ? 'active' : ''`} key={index} onClick={() => setTx(tx)}>
                                    <p className="address">{tx.chatAddress}</p>
                                    <p className="lastMessage">Hello</p>
                                </div>
                            );
                        })}
                </Scrollbars>
            </div>
            <div className="chat-messages">
                <div className="transaction chatAddress">
                    <p className="label">Chat Address</p>
                    <p className="value">{_tx?.chatAddress}</p>
                </div>
                <Scrollbars>
                    {_tx &&
                        _tx.messages
                            .sort((a, b) => (a.time > b.time ? 1 : -1))
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
