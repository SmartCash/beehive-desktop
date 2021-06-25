import * as CryptoJS from 'crypto-js';
import React, { useState, useContext, useEffect } from 'react';
import { Modal } from '../modal/modal';
import style from './password-modal.module.css';
import { WalletContext } from 'application/context/WalletContext';
const { ipcRenderer } = window.require('electron');


export function PasswordModal(props) {
    const { callBack, onClose } = props;
    const { setPassword } = useContext(WalletContext);
    const [localPassword, setLocalPassword] = useState();
    const [_isValidPassword, setValidPassword] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [savePasswordInContext, setSavePasswordInContext] = useState(false);

    function isValidPassword(password){
        const encryptedWallet = ipcRenderer.sendSync('getWalletData');
        let decryptedWallet;

        if (encryptedWallet) {
            try {
                decryptedWallet = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(encryptedWallet, password));
                return true;
            } catch (e) {
                return false;
            }
        }
    }

    const handleCallback = () => {
        if(isValidPassword(localPassword)){
            if (savePasswordInContext) {
                setPassword(localPassword);
            }

            callBack(localPassword, savePasswordInContext)
        } else {
            setValidPassword(false);
        }
    }

    return (
        <Modal title="Password" onClose={onClose}>
            <form onSubmit={e => { e.preventDefault(); handleCallback(e); }}>
            <p>Please, input your password to complete this action.</p>
            <p>Check the flag "Remember Password" to hide this modal in future actions.</p>

            <div className={style['password-wrapper']}>
                <input
                    className={style.sendinput}
                    placeholder="Insert your password"
                    type="password"
                    autoFocus
                    onInput = {(event) => setLocalPassword(event.target.value)}
                    type={showPassword ? 'text' : 'password'}
                />

                <button type="button" className={style.btnShow}
                 onClick={() => setShowPassword(!showPassword)}
                 > {showPassword ? 'Hide' : 'Show'}
                 </button>
            </div>

            <div className={style.accept}>
                <input id="accept" type='checkbox' onChange={(event) => setSavePasswordInContext(event.target.checked)} />
                <label htmlFor='accept'>Remember password</label>
            </div>

            {_isValidPassword === false && (
                <p className="alert-error">Wrong password.</p>
            )}


            <button type="submit" className={style.sendbutton}>Send</button>
            </form>
        </Modal>
    );
}
