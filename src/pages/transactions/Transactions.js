import React, { useContext, useEffect, useState } from 'react';
import Page from '../../components/Page';
import { WalletContext } from '../../context/WalletContext';
import { getTransactionHistory } from '../../lib/sapi';
import './Transactions.css';
import { Scrollbars } from 'react-custom-scrollbars';
import Countdown from 'react-countdown';
const electron = window.require('electron');

const renderer = ({ hours, minutes, seconds, completed }) => {
    return seconds;
};

function Transactions() {
    const { walletCurrent } = useContext(WalletContext);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState();
    const [loading, setLoading] = useState();
    const [disableRefresh, setDisableRefresh] = useState(false);

    async function _getTransactionHistory() {
        setLoading(true);
        setError(null);
        setHistory([]);
        setDisableRefresh(true);
        await getTransactionHistory(walletCurrent)
            .then((data) => setHistory(data))
            .catch(() => setError('There is no transactions for this wallet'))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        _getTransactionHistory();
        setTimeout(() => _getTransactionHistory(), 60000);
    }, [walletCurrent]);

    return (
        <Page className="page-transactions">
            <button onClick={() => _getTransactionHistory()} disabled={disableRefresh} className="refreshBtn">
                Refresh {''}
                {disableRefresh && (
                    <Countdown date={Date.now() + 30000} onComplete={() => setDisableRefresh(false)} renderer={renderer} />
                )}
            </button>
            {loading && <p className="error">Loading Transactions</p>}
            {error && <p className="error">{error}</p>}
            {!error && history && (
                <Scrollbars>
                    {history?.map((tx, index) => {
                        return (
                            <div className="transaction" key={index}>
                                <p className="label">Type</p>
                                <p className="value">{tx.direction}</p>
                                <p className="label">Amount</p>
                                <p className="value">{tx.amount}</p>
                                <p className="label">Transaction Id</p>
                                <button
                                    className="value"
                                    onClick={() => electron.shell.openExternal(`http://explorer.smartcash.org/tx/${tx.txid}`)}
                                >
                                    {tx.txid}
                                </button>
                            </div>
                        );
                    })}
                </Scrollbars>
            )}
        </Page>
    );
}
export default Transactions;
