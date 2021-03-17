import * as CryptoJS from 'crypto-js';
import { isPK } from '../../../lib/smart';
import { WalletContext } from '../../../context/WalletContext';
import { createNewWalletKeyPair, getAddress } from '../../../lib/sapi';
import React, { useContext, useState } from 'react';
import style from '../wallet-modal.module.css';

export function PrivateKeyImport({ hide, disableCloseButton, setCreateWallet }) {
    const [wallet, setWallet] = useState();
    const [privateKey, setPrivateKey] = useState();
    const [_password, setPassword] = useState();
    const [error, setError] = useState('');
    const { addWallet, decryptWallets } = useContext(WalletContext);

    const insertPrivateKey = (event) => setPrivateKey(event.target.value);

    const handleImportPrivateKey = async () => {
        const wallets = await decryptWallets(_password);
        if ((wallets && wallets.length > 0) || disableCloseButton) {
            isPK(privateKey)
                .then(() => {
                    const _wallet = {
                        privateKey: CryptoJS.AES.encrypt(privateKey, _password).toString(),
                        address: getAddress(privateKey),
                    };
                    addWallet(_wallet, _password);
                    hide();
                })
                .catch(() => setError('Invalid Private Key'));
        } else {
            setError('Wallet is not  possible to decrypt using this password.');
        }
    };

    const handleCreateNewOne = () => {
        setError('');
        setCreateWallet(true);
        setWallet(createNewWalletKeyPair());
    };

    return (
        <div className={style['import-address']}>
            <h2>Import from Private Key</h2>
            <textarea onInput={insertPrivateKey} placeholder="Insert your private key here" rows={5} />
            <input type="password" placeholder="Your password" onInput={(event) => setPassword(event.target.value)} />
            {error && <p>{error}</p>}
            <button onClick={handleImportPrivateKey}>Import</button>
            <button onClick={handleCreateNewOne}>Create new one</button>
        </div>
    );
}
