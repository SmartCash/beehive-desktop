import React, { useContext, useEffect } from 'react';
import { WalletContext } from 'application/context/WalletContext';
import { math } from 'smartcashjs-lib/src/index';

function WalletsBalance() {
    const { wallets, getAndUpdateWalletsBallance } = useContext(WalletContext);

    useEffect(() => {
        const timer = setInterval(async () => await getAndUpdateWalletsBallance(wallets), 60000);
        return () => clearInterval(timer);
    }, [wallets]);

    return (
        <div className="wallets-balance">
            <p className="amount">
                Balance:{' '}
                {math
                    .sumFloats(wallets.map((wallet) => Number(wallet.balance.unlocked)))
                    .toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 4,
                    })
                    .replace('$', '∑') || 0}
            </p>
            <p className="fiat">
                Locked:{' '}
                {math
                    .sumFloats(wallets.map((wallet) => Number(wallet.balance.locked)))
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
