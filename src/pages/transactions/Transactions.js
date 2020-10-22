import React, { useContext, useEffect, useState } from 'react';
import Page from '../../components/Page';
import { WalletContext } from '../../context/WalletContext';
import { getTransactionHistory } from '../../lib/sapi';
import './Transactions.css';
import { Scrollbars } from 'react-custom-scrollbars';

function Transactions() {
    const { walletCurrent } = useContext(WalletContext);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        async function _getTransactionHistory() {
            await getTransactionHistory(walletCurrent.address)
                .then((data) => setHistory(data))
                .catch((error) => console.error(error));
        }
        _getTransactionHistory();
    }, [walletCurrent]);

    return (
        <Page className='page-transactions'>
            <Scrollbars>
                {history?.map((tx, index) => {
                    return (
                        <div className="transaction" key={index}>
                            <p className="label">Type</p>
                            <p className="value">{tx.direction}</p>
                            <p className="label">Fees</p>
                            <p className="value">{tx.fees}</p>
                            <p className="label">Amount</p>
                            <p className="value">{tx.amount}</p>
                            <p className="label">Transaction Id</p>
                            <p className="value">{tx.txid}</p>
                        </div>
                    );
                })}
            </Scrollbars>
        </Page>
    )
}
export default Transactions;
