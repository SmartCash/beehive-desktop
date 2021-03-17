import React, { useState } from 'react';
import { Modal } from '../modal/modal';
import { PrivateKeyImport } from './private-key/private-key-import';
import { PrivateKeyCreate } from './private-key/private-key-create';
import style from './wallet-modal.module.css';

export default function WalletModal({ isShowing, hide, disableCloseButton, wallet, setWallet }) {
    const [createWallet, setCreateWallet] = useState(false);

    const handleCloseModal = () => {
        setCreateWallet(false);
        hide();
    };

    return (
        isShowing && (
            <Modal title="New Wallet" onClose={handleCloseModal} showCloseButton={disableCloseButton}>
                <div className={style['address-content']}>
                    {!createWallet && (
                        <PrivateKeyImport
                            hide={hide}
                            disableCloseButton={disableCloseButton}
                            setCreateWallet={setCreateWallet}
                            wallet={wallet}
                            setWallet={setWallet}
                        />
                    )}
                    {createWallet && (
                        <PrivateKeyCreate
                            hide={hide}
                            disableCloseButton={disableCloseButton}
                            wallet={wallet}
                            setWallet={setWallet}
                        />
                    )}
                </div>
            </Modal>
        )
    );
}
