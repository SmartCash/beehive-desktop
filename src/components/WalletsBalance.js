import React, { useContext } from 'react';
import { WalletContext } from '../context/WalletContext';

function WalletsBalance() {
    const { walletsBalance } = useContext(WalletContext);
    return (
        <div className="wallets-balance">
            <h2 className="title">Balance</h2>
            <p className="amount">{walletsBalance}</p>
            <p className="fiat">SMART</p>
        </div>
    );
}

export default WalletsBalance;
