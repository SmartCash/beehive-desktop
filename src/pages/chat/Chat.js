import React, { useContext, useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Page from '../../components/Page';
import { WalletContext } from '../../context/WalletContext';
import { getTransactionHistoryGroupedByAddresses } from '../../lib/sapi';
import './Chat.css';
import { ChatMessages } from './ChatMessages';
import { NewChat } from './NewChat';

export function Chat() {
    const { walletCurrent } = useContext(WalletContext);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState();
    const [loading, setLoading] = useState();
    const [initialLoading, setInitialLoading] = useState();
    const [_tx, setTx] = useState();

    async function _getTransactionHistory() {
        setLoading(true);
        setError(null);
        setHistory([]);
        await getTransactionHistoryGroupedByAddresses(walletCurrent)
            .then((data) => {
                setHistory(data);
                if (data?.length >= 0) {
                    setTx(data[0]);
                }
            })
            .catch(() => setError('There is no chat for this wallet'))
            .finally(() => {
                setLoading(false);
                setInitialLoading(false);
            });
    }

    const handleGetTransactions = () => {
        setInitialLoading(true);
        _getTransactionHistory();
        setTimeout(() => _getTransactionHistory(), 60000);
    };

    useEffect(handleGetTransactions, [walletCurrent]);

    return (
        <Page className="page-chat">
            <div className="chat-wallets">
                <div className="header">
                    <span className="title">Chats</span>
                    <button onClick={() => setTx()}>Start chat</button>
                </div>
                {initialLoading && <p className="error">Loading Conversations</p>}
                {error && <p className="error">{error}</p>}
                <Scrollbars>
                    {history &&
                        history?.map((tx, index) => {
                            return (
                                <div
                                    className={`wallet ${tx.chatAddress === _tx?.chatAddress} ? 'active' : ''`}
                                    key={index}
                                    onClick={() => setTx(tx)}
                                >
                                    <p className="address">{tx.chatAddress}</p>
                                    <p className="lastMessage">Hello</p>
                                </div>
                            );
                        })}
                </Scrollbars>
            </div>
            {!initialLoading && _tx && <ChatMessages />}
            {!initialLoading && !_tx && <NewChat />}
        </Page>
    );
}
