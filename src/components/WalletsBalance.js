import React, { useContext, useEffect } from 'react';
import { WalletContext } from '../context/WalletContext';

function WalletsBalance() {
    const { wallets, updateBalance, walletsBalance } = useContext(WalletContext);

    useEffect(() => {
        const getBalance = () => {
            const reducer = (accumulator, currentValue) => accumulator + currentValue;
            return wallets && wallets.map((wallet) => wallet.balance || 0).reduce(reducer, 0);
        };
        updateBalance(getBalance());
    }, [wallets]);

    return (
        <div className="wallets-balance">
            <h2 className="title">Balance</h2>
            <p className="amount">{walletsBalance}</p>
            <p className="fiat">SMART</p>
        </div>
    );
}

export default WalletsBalance;
