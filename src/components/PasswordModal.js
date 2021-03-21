import React, { useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import loader from '../assets/images/loader.svg';
import { ReactComponent as Logo } from '../assets/images/logo.svg';
import { WalletContext } from '../context/WalletContext';
import style from './modal/modal.module.css';

function PasswordModal() {
    const { decryptWallets, decryptError } = useContext(WalletContext);
    const [showPassword, setShowPassword] = useState(false);
    const [_password, setPassword] = useState();
    const [showModal, setShowModal] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleDecryptWallets = async () => {
        setLoading(true);
        const wallets = await decryptWallets(_password);
        setLoading(false);
        if (wallets && wallets.length > 0) setShowModal(false);
    };
    return (
        showModal &&
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
                                {!loading && (
                                    <React.Fragment>
                                        <div className={style['password-wrapper']}>
                                            <input
                                                className="form-control"
                                                placeholder="Insert your password"
                                                onInput={(e) => setPassword(e.target.value)}
                                                type={showPassword ? 'text' : 'password'}
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                className={style.btn}
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                        {decryptError && (
                                            <p className="alert-error">Wallet is not possible decrypt using this password.</p>
                                        )}
                                        <button className={style.btn} onClick={handleDecryptWallets}>
                                            Open wallet using password above
                                        </button>
                                    </React.Fragment>
                                )}
                                {loading && (
                                    <p className={style['loading']}>
                                        <img src={loader} alt={'loading...'} />
                                    </p>
                                )}
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
