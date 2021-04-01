import React, { useState, useContext, useEffect } from 'react';
import { Modal } from '../modal/modal';
import style from './password-modal.module.css';
import { WalletContext } from 'application/context/WalletContext';

export function PasswordModal(props) {        
    const { callBack, onClose } = props;    
    const { setPassword, isValidPassword} = useContext(WalletContext);
    const [localPassword, setLocalPassword] = useState();
    const [showPassword, setShowPassword] = useState(false);
    const [savePasswordInContext, setSavePasswordInContext] = useState(false);
    var _isValidPassword = true;

    useEffect(() => {        
        console.log('open')
        console.log(_isValidPassword)
    }, []);

    const handleCallback = () => {        
        _isValidPassword = isValidPassword(localPassword);
        console.log(_isValidPassword);
        
        if(_isValidPassword){
            if (savePasswordInContext) {
                setPassword(localPassword);
            }
                        
            callBack(localPassword, savePasswordInContext)
        }       
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

            {!_isValidPassword && (
                <p className="alert-error">Wrong password.</p>
            )}


            <button className={style.sendbutton} onClick={handleCallback}>Send</button>
        </Modal>
    );
}
