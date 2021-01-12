import React, { useContext } from 'react';
import './Wallet.css';
import { WalletContext } from '../context/WalletContext';
import { ReactComponent as IconCopy } from '../assets/images/copy.svg';
const electron = window.require('electron');


function Wallet({ wallet, isCurrent }) {
    const { setWalletCurrent } = useContext(WalletContext);                    
    return (
        <div className={`wallet ${isCurrent && 'wallet-current'}`}  role="button">
            <div className="symbol">∑</div>
            <div className="content">
                <p className="amount" onClick={() => setWalletCurrent(wallet)}>{wallet.balance}</p>
                <span className="address" onClick={() => setWalletCurrent(wallet)}>{wallet.label || wallet.address} </span>
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
