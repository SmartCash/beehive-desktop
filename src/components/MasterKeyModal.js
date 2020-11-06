import React, { useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import style from './WalletModal.module.css';
import { WalletContext } from '../context/WalletContext';

function MasterKeyModal() {
    const { masterKey, saveMasterKey } = useContext(WalletContext);
    const [ _masterKey, setMasterKey ] = useState();

    return (
        !masterKey &&
        ReactDOM.createPortal(
            <React.Fragment>
                <div className={style['modal-overlay']} />
                <div className={style['modal-wrapper']} aria-modal aria-hidden tabIndex={-1} role="dialog">
                    <div className={style['modal']}>
                        <div className={style['modal-header']}>
                            <h2 className={style['modal-title']}>Master Key</h2>
                        </div>
                        <div className={style['modal-body']}>
                            <div className={style['address-content']}>
                                <p>All data will be encrypted using this key, insert your personal master key to decrypt all data stored in SmartCash Hub and recover your private keys. Keep in mind this master key will not storage on the SmartCash Hub.</p>
                                <input className="form-control" placeholder="Insert your personal master key" onInput={(e) => setMasterKey(e.target.value)} />
                                {masterKey}
                                <button onClick={() => saveMasterKey(_masterKey)}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>,
            document.getElementById('root'),
        )
    );
}

export default MasterKeyModal;
