import React, { useState, useContext } from 'react';
import { Modal } from '../modal/modal';
import style from './password-modal.module.css';
import { WalletContext } from 'application/context/WalletContext';

export function PasswordModal(props) {        
    const { callBack, onClose } = props;
    //Get password from walletContext
    const { setPassword } = useContext(WalletContext);
    const [localPassword, setLocalPassword] = useState();
    const [showPassword, setShowPassword] = useState(false);
    const [savePasswordInContext, setSavePasswordInContext] = useState(false);
    
    const handleCallback = () => {
        if (savePasswordInContext) {
            setPassword(localPassword);
        }

        callBack(localPassword, savePasswordInContext)
    }

    return (
        <Modal title="Password" onClose={onClose}>
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


            <button className={style.sendbutton} onClick={handleCallback}>Send</button>
        </Modal>
    );
}
