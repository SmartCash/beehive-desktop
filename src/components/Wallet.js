import React from 'react';

function Wallet({wallet}) {
    return (
        <div className="wallet">
            <div className="symbol">∑</div>
            <div class="content">
                <p className="amount">{wallet.balance}</p>
                <p className="address">{wallet.label || wallet.address}</p>
                <ul>
                    <li>Rewards</li>
                </ul>
            </div>
        </div>
    );
}

export default Wallet;
