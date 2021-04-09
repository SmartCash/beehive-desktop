import React, { useContext } from 'react';
import './Wallet.css';
import { WalletContext } from 'application/context/WalletContext';
import { ReactComponent as IconCopy } from '../assets/images/copy.svg';
import { Balance } from 'presentation/components/Balance';

const electron = window.require('electron');

function Wallet({ wallet, isCurrent }) {
    const { setWalletCurrent, hideBalance } = useContext(WalletContext);
    return (
        <div className={`wallet ${isCurrent && 'wallet-current'}`} role="button">
            <div className="symbol" onClick={() => setWalletCurrent(wallet)}>
                ∑
            </div>
            <div className="content">
                <div onClick={() => setWalletCurrent(wallet)}>
                    <p className="amount">
                        <Balance value={ wallet.balance.unlocked } />             
                    </p>
                    <span className="address">{wallet.label || wallet.address} </span>
                </div>
                <button
                    className="btn copy"
                    title="Copy address to clipboard"
                    onClick={() => electron.clipboard.writeText(wallet.address)}
                >
                    <IconCopy className="btnCopy" />
                </button>
            </div>
        </div>
    );
}

export default Wallet;
