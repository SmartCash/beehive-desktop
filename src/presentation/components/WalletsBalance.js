import React, { useContext, useEffect } from 'react';
import { WalletContext } from 'application/context/WalletContext';
import { sumFloats } from 'application/lib/math';
import { ButtonShowHideBalance } from './button-show-hide-balance/button-show-hide-balance';
import { Balance } from 'presentation/components/Balance';

function WalletsBalance() {
    const { wallets, getAndUpdateWalletsBallance, hideBalance } = useContext(WalletContext);

    useEffect(() => {
        const timer = setInterval(async () => await getAndUpdateWalletsBallance(wallets), 60000);
        return () => clearInterval(timer);
    }, [wallets]);

    return (
        <div className='wallets-balance'>
            <p className='amount'>
                <span className='gray'> Balance:{' '} </span>
                <Balance value={sumFloats(wallets.map((wallet) => Number(wallet.balance.unlocked)))} />
                <ButtonShowHideBalance />
            </p>

            <div className='space'></div>

            <p className='fiat'>
                <span className='gray'>Locked:{' '} </span>
                <Balance value={sumFloats(wallets.map((wallet) => Number(wallet.balance.locked)))} />
            </p>
        </div>
    );
}

export default WalletsBalance;
