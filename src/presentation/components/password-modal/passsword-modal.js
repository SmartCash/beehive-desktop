import { use } from 'random';
import React, { useEffect, useState } from 'react';
import { Modal } from '../modal/modal';
import style from './password-modal.module.css';

export function PasswordModal(props) {    
    console.log(props);
    const { callBack, onClose } = props;
    //Get password from walletContext
    const [localPassword, setLocalPassword] = useState();

    useEffect(() => {
        // Todo verify if has password from WalletContext and call callback if true
        // if (password) {
        //     callback()
        // }
    }, [])

    const handleCallback = () => {
        callBack(localPassword)
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
                    onInput = {
                        (event) => setLocalPassword(event.target.value)
                    }
                />

                <button type="button" className={style.btnShow}>Show</button>
            </div>                               
           
            <div className={style.accept}>
                <input id="accept" type='checkbox' />
                <label htmlFor='accept'>Remember password</label>
            </div>


            <button className={style.sendbutton} onClick={handleCallback}>Send</button>
        </Modal>
    );
}
