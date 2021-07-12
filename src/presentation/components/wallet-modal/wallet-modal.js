import React, { useState } from 'react';
import { Modal } from '../modal/modal';
import { PrivateKeyImport } from './private-key/private-key-import';
import { PrivateKeyCreate } from './private-key/private-key-create';
import style from './wallet-modal.module.css';
import { Mnemonic } from './mnemonic/mnemonic';

export default function WalletModal({ isShowing, hide, disableCloseButton }) {
    const [tab, setTab] = useState(1);
    const [createWallet, setCreateWallet] = useState(false);
    const [wallet, setWallet] = useState();

    const handleCloseModal = () => {
        setCreateWallet(false);
        hide();
    };

    const handleSetTab = (tab) => {
        setCreateWallet(false);
        setTab(tab);
    };

    return (
        isShowing && (
            <Modal title='Creating Your BeeHive Desktop Wallet' onClose={handleCloseModal}
                   showCloseButton={disableCloseButton}>
                <div className={style['address-content']}>
                    <div className={style.tabs}>
                        <button className={tab === 0 ? style.activated : null} onClick={() => handleSetTab(0)}>
                            Use A Single Private Key
                        </button>
                        <button className={tab === 1 ? style.activated : null} onClick={() => handleSetTab(1)}>
                            Use Mnemonic Phrase (Recommended)
                        </button>
                    </div>

                    {tab === 0 && (
                        <>
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
                                    setCreateWallet={setCreateWallet}
                                    wallet={wallet}
                                    setWallet={setWallet}
                                />
                            )}
                        </>
                    )}

                    {tab === 1 && (
                        <>
                            <Mnemonic hide={hide} />
                        </>
                    )}
                </div>
            </Modal>
        )
    );
}
