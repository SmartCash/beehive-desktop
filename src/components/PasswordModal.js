import React, { useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import style from './WalletModal.module.css';
import { WalletContext } from '../context/WalletContext';
import { ReactComponent as Logo } from '../assets/images/logo.svg';

function PasswordModal() {
    const { masterKey, saveMasterKey, decryptError } = useContext(WalletContext);
    const [_masterKey, setMasterKey] = useState();
    const [showPK, setShowPK] = useState(false);

    return (
        !masterKey &&
        ReactDOM.createPortal(
            <React.Fragment>
                <div className={style['modal-overlay']} />
                <div className={style['modal-wrapper']} aria-modal aria-hidden tabIndex={-1} role="dialog">
                    <div className={style['modal']}>
                        <div className={style['modal-header']}>
                            <Logo className="logo" />
                            <p>Welcome to SmartCash Hub</p>
                        </div>
                        <div className={style['modal-body']}>
                            <div className={style['address-content']}>
                                <p>All data will be encrypted with this password.</p>
                                <p>Insert your password to decrypt all data stored in the SmartCash Hub.</p>
                                <p>Your wallet can only be recovered with your password.</p>
                                <p>Keep in mind that this password will not be stored on the SmartCash Hub.</p>
                                <div className={style['password-wrapper']}>
                                    <input
                                        className="form-control"
                                        placeholder="Insert your password"
                                        onInput={(e) => setMasterKey(e.target.value)}
                                        type={showPK ? 'text' : 'password'}
                                        autoFocus
                                    />
                                    <button type="button" className="showPK" onClick={() => setShowPK(!showPK)}>
                                        {showPK ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                {decryptError && (
                                    <p className="alert-error">Do not possible decrypt local data using this password.</p>
                                )}
                                <button onClick={() => saveMasterKey(_masterKey)}>Use password and/or recover wallet</button>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>,
            document.getElementById('root')
        )
    );
}

export default PasswordModal;
