import React, { useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import loader from 'presentation/assets/images/loader.svg';
import { ReactComponent as Logo } from 'presentation/assets/images/logo.svg';
import { WalletContext } from 'application/context/WalletContext';
import style from '../modal/modal.module.css';
var pjson = require('../../../../package.json');

export function LoginModal() {
    const { decryptWallets, decryptError, setPassword } = useContext(WalletContext);
    const [showPassword, setShowPassword] = useState(false);
    const [_password, setLocalPassword] = useState();
    const [showModal, setShowModal] = useState(true);
    const [loading, setLoading] = useState(false);
    const [savePasswordInContext, setSavePasswordInContext] = useState(false);

    const handleDecryptWallets = async () => {
        setLoading(true);
        const wallets = await decryptWallets(_password);
        setLoading(false);
        if (wallets && wallets.length > 0) {
            setShowModal(false);

            if (savePasswordInContext) {
                setPassword(_password);
            }
        };
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
                            <p className="welcome">Welcome to BeeHive Desktop</p>

                            <p className="version">v{pjson.version}</p>
                        </div>
                        <div className={style['modal-body']}>
                            <div className={style['address-content']}>
                                {!loading && (
                                    <React.Fragment>
                                        <div className={style['password-wrapper']}>
                                            <input
                                                className={style.inputPass}
                                                placeholder="Enter your BeeHive password"
                                                onInput={(e) => setLocalPassword(e.target.value)}
                                                type={showPassword ? 'text' : 'password'}
                                                autoFocus
                                            />


                                            <button
                                                type="button"
                                                className={style.btnShow}
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? 'Hide' : 'Show'}
                                            </button>

                                        </div>

                                        {decryptError && (
                                            <p className="alert-error">Password entered is not correct.</p>
                                        )}

                                        <div className={style.accept}>
                                            <input id="accept" type='checkbox' onChange={(event) => setSavePasswordInContext(event.target.checked)} />
                                            <label htmlFor='accept'>Remember password while open.</label>
                                        </div>

                                        <div className={style.buttonArea}>
                                        <button className={style.btnOpen} onClick={handleDecryptWallets}>Start BeeHive</button>
                                        </div>
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
