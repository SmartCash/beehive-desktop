import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import style from './WalletModal.module.css';
import { createNewWalletKeyPair } from '../lib/sapi';
import { WalletContext } from '../context/WalletContext';
import generatePDF from '../lib/GeneratorPDF'

const WalletModal = ({ isShowing, hide }) => {
    const wallet = createNewWalletKeyPair();
    const { addWallet } = useContext(WalletContext);
    const handleAddWallet = () => {
        addWallet(wallet);
        generatePDF([wallet], 'SmartCash_Address');
        hide();
    }
    return (
        isShowing &&
        ReactDOM.createPortal(
            <React.Fragment>
                <div className={style['modal-overlay']} />
                <div className={style['modal-wrapper']} aria-modal aria-hidden tabIndex={-1} role="dialog">
                    <div className={style['modal']}>
                        <div className={style['modal-header']}>
                            <h2>New Wallet</h2>
                            <button
                                type="button"
                                className={style['modal-close-button']}
                                data-dismiss="modal"
                                aria-label="Close"
                                onClick={hide}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className={style['modal-body']}>
                            <div>
                                <h2>New address</h2>
                                <div>
                                    <p>{wallet.address}</p>
                                </div>
                                <div>
                                    <p>{wallet.privateKey}</p>
                                </div>
                                <button onClick={handleAddWallet}>Use this one and save as PDF</button>
                            </div>
                            <div>
                                <h2>Import from Private Key</h2>
                                <textarea></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>,
            document.body
        )
    );
};

export default WalletModal;
