import React, { useContext, useEffect } from 'react';
import { WalletContext } from 'application/context/WalletContext';
import { sumFloats } from 'application/lib/math';

function WalletsBalance() {
    const { wallets, getAndUpdateWalletsBallance } = useContext(WalletContext);

    useEffect(() => {
        const timer = setInterval(async () => await getAndUpdateWalletsBallance(wallets), 60000);
        return () => clearInterval(timer);
    }, [wallets]);

    return (
        <div className="wallets-balance">
            <p className="amount">
                <span className="gray"> Balance:{' '} </span>
                {sumFloats(wallets.map((wallet) => Number(wallet.balance.unlocked)))
                    .toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 4,
                    })
                    .replace('$', '∑') || 0}
            </p>

            <div className="space"></div>

            <p className="fiat">
                <span className="gray">Locked:{' '} </span>
                    {sumFloats(wallets.map((wallet) => Number(wallet.balance.locked)))
                        .toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 4,
                        })
                        .replace('$', '∑') || 0}
            </p>
        </div>
    );
}

export default WalletsBalance;
