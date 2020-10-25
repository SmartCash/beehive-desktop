import React from 'react';

function Wallet({wallet, isCurrent}) {
    return (
        <div className={`wallet ${isCurrent && 'wallet-current'}`}>
            <div className="symbol">∑</div>
            <div className="content">
                <p className="amount">{wallet.balance}</p>
                <p className="address">{wallet.label || wallet.address}</p>
            </div>
        </div>
    );
}

export default Wallet;
