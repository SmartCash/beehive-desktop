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
    const { addWallet } = useContext(WalletContext);
    const [privateKey, setPrivateKey] = useState();
    const [isPKInvalid, setIsPKInvalid] = useState(false);
    const [_password, setPassword] = useState();

    const handleAddWallet = () => {
        generatePDF([wallet], 'SmartCash_Address');
        const _wallet = {
            privateKey: CryptoJS.AES.encrypt(wallet.privateKey, _password).toString(),
            address: wallet.address,
        };
        addWallet(_wallet, _password);
        setCreateWallet(false);
        hide();
    };

    const handleImportPrivateKey = () => {
        isPK(privateKey)
            .then(() => {
                const _wallet = {
                    privateKey: CryptoJS.AES.encrypt(privateKey, _password).toString(),
                    address: getAddress(privateKey),
                };
                addWallet(_wallet, _password);
                hide();
            })
            .catch(() => setIsPKInvalid(true));
    };

    const handleCreateNewOne = () => {
        setCreateWallet(true);
        setWallet(createNewWalletKeyPair());
    };

    const insertPrivateKey = (event) => setPrivateKey(event.target.value);

    const handleCloseModal = () => {
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
                                        <input type="password" placeholder="Password" onInput={(event) => setPassword(event.target.value)}/>
                                        {isPKInvalid && <p>Invalid Private Key</p>}
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
                                            <input type="password" placeholder="Password" onInput={(event) => setPassword(event.target.value)}/>
                                        </div>
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
