import React from 'react';
import style from './TransactionHistory.module.css';

const TransactionsHistory = ({ address, history }) => {
    if (!address) {
        return <div>Enter a address to see transactions</div>;
    }

    return (
        <div>
            Showing last 5 transactions.
            <a href={`https://sapi-explorer.herokuapp.com/#/address/${address}`} target="_blank" rel="noopener noreferrer">
                See all
            </a>
            {!history && <p>Loading</p>}
            {history &&
                history?.map((tx, index) => {
                    return (
                        <div className={style.cardWrapper} key={index}>
                            <strong>Type</strong>
                            <p>{tx.direction}</p>
                            <strong>Fees</strong>
                            <p>{tx.fees}</p>
                            <strong>Amount</strong>
                            <p>{tx.amount}</p>
                            <strong>Transaction Id</strong>
                            <p>{tx.txid}</p>
                        </div>
                    );
                })}
        </div>
    );
};

export default TransactionsHistory;
