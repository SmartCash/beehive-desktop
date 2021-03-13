import React, { useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import { WalletContext } from '../context/WalletContext';
import generatePDF from '../lib/GeneratorPDF';
import { createNewWalletKeyPair, getAddress } from '../lib/sapi';
import { isPK } from '../lib/smart';
import style from './WalletModal.module.css';
import * as CryptoJS from 'crypto-js';

function WalletModal({ isShowing, hide, disableCloseButton }) {
    const [wallet, setWallet] = useState();
    const [createWallet, setCreateWallet] = useState(false);
    const { addWallet, decryptWallets } = useContext(WalletContext);
    const [privateKey, setPrivateKey] = useState();
    const [error, setError] = useState('');
    const [_password, setPassword] = useState();

    const handleAddWallet = async () => {
        const wallets = await decryptWallets(_password);
        if ((wallets && wallets.length > 0) || disableCloseButton) {
            generatePDF([wallet], `SmartCash_Address_${Date.now()}`);
            const _wallet = {
                privateKey: CryptoJS.AES.encrypt(wallet.privateKey, _password).toString(),
                address: wallet.address,
            };
            addWallet(_wallet, _password);
            setCreateWallet(false);
            hide();
        } else {
            setError('Wallet is not possible to decrypt using this password.');
        }
    };

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

    const insertPrivateKey = (event) => setPrivateKey(event.target.value);

    const handleCloseModal = () => {
        setError('');
        setCreateWallet(false);
        setWallet(null);
        hide();
    };

    return (
        isShowing &&
        ReactDOM.createPortal(
            <React.Fragment>
                <div className={style['modal-overlay']} />
                <div className={style['modal-wrapper']} aria-modal aria-hidden tabIndex={-1} role="dialog">
                    <div className={style['modal']}>
                        <div className={style['modal-header']}>
                            <h2 className={style['modal-title']}>New Wallet</h2>
                            {!disableCloseButton && (
                                <button
                                    type="button"
                                    className={style['modal-close-button']}
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    onClick={handleCloseModal}
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            )}
                        </div>

                        <div className={style['modal-body']}>
                            <div className={style['address-content']}>
                                {!createWallet && (
                                    <div className={style['import-address']}>
                                        <h2>Import from Private Key</h2>
                                        <textarea
                                            onInput={insertPrivateKey}
                                            placeholder="Insert your private key here"
                                            rows={5}
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            onInput={(event) => setPassword(event.target.value)}
                                        />
                                        {error && <p>{error}</p>}
                                        <button onClick={handleImportPrivateKey}>Import</button>
                                        <button onClick={handleCreateNewOne}>Create new one</button>
                                    </div>
                                )}

                                {createWallet && (
                                    <div className={style['new-address']}>
                                        <h2>New Private Key</h2>
                                        <div>
                                            <p>
                                                <strong>Public Key (address):</strong>
                                            </p>
                                            <p>{wallet.address}</p>
                                        </div>
                                        <div>
                                            <input
                                                type="password"
                                                placeholder="Password"
                                                onInput={(event) => setPassword(event.target.value)}
                                            />
                                        </div>
                                        {error && <p>{error}</p>}
                                        <button className="btn" onClick={handleAddWallet}>
                                            Use this one and save as PDF
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>,
            document.getElementById('root')
        )
    );
}

function areEqual(prev, next) {
    return prev.isShowing === next.isShowing;
}

export default React.memo(WalletModal, areEqual);
