import React, { useEffect } from 'react';
import { Modal } from '../modal/modal';

export function PasswordModal(props) {
    const { callBack, isShowing, onClose } = props;

    useEffect(() => {
        // Todo verify if has password from WalletContext and call callback if true
        // if (password) {
        //     callback()
        // }
    }, [])

    return (
        <Modal title="Password" onClose={onClose}>
            <input
                className="form-control"
                placeholder="Insert your password"
                autoFocus
            />
            <button onClick={callBack}>Ok</button>
        </Modal>
    );
}
