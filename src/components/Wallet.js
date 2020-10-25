import React, { useContext } from 'react';
import { WalletContext } from '../context/WalletContext';

function Wallet({ wallet, isCurrent }) {
    const { setWalletCurrent } = useContext(WalletContext);

    return (
        <div className={`wallet ${isCurrent && 'wallet-current'}`} onClick={() => setWalletCurrent(wallet)} role="button">
            <div className="symbol">∑</div>
            <div className="content">
                <p className="amount">{wallet.balance}</p>
                <p className="address">{wallet.label || wallet.address}</p>
            </div>
        </div>
    );
}

export default Wallet;
