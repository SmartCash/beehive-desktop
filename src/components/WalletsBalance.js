import React, { useContext, useEffect, useState } from 'react';
import { WalletContext } from '../context/WalletContext';
import { sumFloats } from '../lib/math';

function WalletsBalance() {
    const { wallets, getAndUpdateWalletsBallance } = useContext(WalletContext);

    useEffect(() => {
        setTimeout(() => {
            getAndUpdateWalletsBallance();
        }, 60000);
    }, [wallets]);

    return (
        <div className="wallets-balance">
            <p className="amount">
                Unlocked: {sumFloats(wallets.map((wallet) => Number(wallet.balance.unlocked))).toFixed(8) || 0}
            </p>
            <p className="fiat">Locked: {sumFloats(wallets.map((wallet) => Number(wallet.balance.locked))).toFixed(8) || 0}</p>
        </div>
    );
}

export default WalletsBalance;
