import * as CryptoJS from 'crypto-js';
import React, { useContext, useState } from 'react';
import { WalletContext } from '../../context/WalletContext';
import generatePDF from '../../lib/GeneratorPDF';
import { createNewWalletKeyPair, getAddress } from '../../lib/sapi';
import { isPK } from '../../lib/smart';
import { Modal } from '../modal/modal';
import { PrivateKeyImport } from './private-key/private-key-import';
import { PrivateKeyNew } from './private-key/private-key-new';
import style from './wallet-modal.module.css';

export default function WalletModal({ isShowing, hide, disableCloseButton }) {
    const [wallet, setWallet] = useState();
    const [createWallet, setCreateWallet] = useState(false);
    const { addWallet, decryptWallets } = useContext(WalletContext);

    const [error, setError] = useState('');

    const handleCreateNewOne = () => {
        setError('');
        setCreateWallet(true);
        setWallet(createNewWalletKeyPair());
    };

    const handleCloseModal = () => {
        setError('');
        setCreateWallet(false);
        setWallet(null);
        hide();
    };

    return (
        isShowing && (
            <Modal title="New Wallet" onClose={handleCloseModal} showCloseButton={disableCloseButton}>
                <div className={style['address-content']}>
                    {!createWallet && <PrivateKeyImport />}
                    {createWallet && <PrivateKeyNew />}
                </div>
            </Modal>
        )
    );
}
