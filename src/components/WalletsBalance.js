import React, { useContext } from 'react';
import { WalletContext } from '../context/WalletContext';

function WalletsBalance() {
    const { wallets } = useContext(WalletContext);
    const getBalance = () => {
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        return wallets
            .map(wallet => wallet.balance)
            .reduce(reducer, 0);
    }
    return (
        <div className="wallets-balance">
            <h2 className="title">Balance</h2>
            <p className="amount">{getBalance()}</p>
            <p className="fiat">SMART</p>
        </div>
    );
}

export default WalletsBalance;
