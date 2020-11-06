import React, { useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import style from './WalletModal.module.css';
import { WalletContext } from '../context/WalletContext';

function MnemonicModal() {
    const { masterKey, saveMasterKey, decryptError } = useContext(WalletContext);
    const [ _masterKey, setMasterKey ] = useState();

    return (
        !masterKey &&
        ReactDOM.createPortal(
            <React.Fragment>
                <div className={style['modal-overlay']} />
                <div className={style['modal-wrapper']} aria-modal aria-hidden tabIndex={-1} role="dialog">
                    <div className={style['modal']}>
                        <div className={style['modal-header']}>
                            <h2 className={style['modal-title']}>Mnemonic</h2>
                        </div>
                        <div className={style['modal-body']}>
                            <div className={style['address-content']}>
                                <p>
                                    All data will be encrypted with this mnemonic.
                                    Insert your mnemonic to decrypt all data stored in the SmartCash Hub. Your wallet can only be recovered with your mnemonic.
                                    Keep in mind that this mnemonic will not be stored on the SmartCash Hub.
                                </p>
                                <input className="form-control" placeholder="Insert your mnemonic" onInput={(e) => setMasterKey(e.target.value)} />
                                {decryptError && <p className="alert-error">Do not possible decrypt local data using this mnemonic.</p>}
                                <button onClick={() => saveMasterKey(_masterKey)}>Use mnemonic and recover wallet</button>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>,
            document.getElementById('root'),
        )
    );
}

export default MnemonicModal;
