import * as CryptoJS from 'crypto-js';
import { WalletContext } from '../../../context/WalletContext';
import generatePDF from '../../../lib/GeneratorPDF';
import React, { useContext, useState } from 'react';
import style from '../wallet-modal.module.css';

export function PrivateKeyCreate({ hide, disableCloseButton, wallet }) {
    const [_password, setPassword] = useState();
    const [error, setError] = useState('');
    const { addWallet, decryptWallets } = useContext(WalletContext);

    const handleAddWallet = async () => {
        const wallets = await decryptWallets(_password);
        if ((wallets && wallets.length > 0) || disableCloseButton) {
            generatePDF([wallet], `SmartCash_Address_${Date.now()}`);
            const _wallet = {
                privateKey: CryptoJS.AES.encrypt(wallet.privateKey, _password).toString(),
                address: wallet.address,
            };
            addWallet(_wallet, _password);
            hide();
        } else {
            setError('Wallet is not possible to decrypt using this password.');
        }
    };

    return (
        <div className={style['new-address']}>
            <h2>New Private Key</h2>
            <div>
                <p>
                    <strong>Public Key (address):</strong>
                </p>
                <p>{wallet?.address}</p>
            </div>
            <div>
                <input type="password" placeholder="Your password" onInput={(event) => setPassword(event.target.value)} />
            </div>
            {error && <p>{error}</p>}
            <button className="btn" onClick={handleAddWallet}>
                Use this one and save as PDF
            </button>
        </div>
    );
}
