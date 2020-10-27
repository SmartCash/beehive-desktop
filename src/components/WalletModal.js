import React, { useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import style from './WalletModal.module.css';
import { createNewWalletKeyPair, getAddress } from '../lib/sapi';
import { isPK } from '../lib/smart';
import { WalletContext } from '../context/WalletContext';
import generatePDF from '../lib/GeneratorPDF';

function WalletModal({ isShowing, hide, disableCloseButton }) {
    const [wallet, setWallet] = useState();
    const { addWallet } = useContext(WalletContext);
    const [privateKey, setPrivateKey] = useState();
    const [isPKInvalid, setIsPKInvalid] = useState(false);
    const handleAddWallet = () => {
        addWallet(wallet);
        generatePDF([wallet], 'SmartCash_Address');
        hide();
    };
    const handleImportPrivateKey = () => {
        isPK(privateKey)
            .then(() => {
                const _wallet = {
                    privateKey,
                    address: getAddress(privateKey),
                };
                addWallet(_wallet);
                hide();
            })
            .catch(() => setIsPKInvalid(true));
    };

    const insertPrivateKey = (event) => setPrivateKey(event.target.value);

    useEffect(() => {
        setWallet(createNewWalletKeyPair());
    }, []);

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
                                    onClick={hide}
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            )}
                        </div>
                        <div className={style['modal-body']}>
                            <div className={style['address-content']}>
                                <div className={style['new-address']}>
                                    <h2>New address</h2>
                                    <div>
                                        <p>
                                            <strong>Public Key (address):</strong>
                                        </p>
                                        <p>{wallet.address}</p>
                                    </div>
                                    <div>
                                        <p>
                                            <strong>Private Key:</strong>
                                        </p>
                                        <p>{wallet.privateKey}</p>
                                    </div>
                                    <button onClick={handleAddWallet}>Use this one and save as PDF</button>
                                </div>
                                <div className={style['import-address']}>
                                    <h2>Import from Private Key</h2>
                                    <input
                                        onInput={insertPrivateKey}
                                        placeholder="Insert your private key here"
                                    />
                                    {isPKInvalid && <p>Invalid Private Key</p>}
                                    <button onClick={handleImportPrivateKey}>Import</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>,
            document.getElementById('root')
        )
    );
};

function areEqual(prev, next) {
    return prev.isShowing === next.isShowing;
}

export default React.memo(WalletModal, areEqual);
