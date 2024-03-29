import { WalletContext } from 'application/context/WalletContext';
import useModal from 'application/hooks/useModal';
import { ReactComponent as IconAdd } from 'presentation/assets/images/add.svg';
import React, { useContext, useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Wallet from './Wallet';
import WalletModal from './wallet-modal/wallet-modal';
import { ReactComponent as IconDownload } from '../assets/images/download.svg';
import { useHistory } from 'react-router-dom';

function Wallets() {
    const { wallets, walletCurrent, password } = useContext(WalletContext);
    const { isShowing, toggle } = useModal();
    const [disableCloseButton, setDisableCloseButton] = useState(false);
    const history = useHistory();

    useEffect(() => {
        if (wallets && wallets.length === 0 && password) {
            setDisableCloseButton(true);
            toggle();
        } else {
            setDisableCloseButton(false);
        }
    }, [wallets]);

    function isCurrent(wallet) {
        return wallet.address === walletCurrent;
    }

    return (
        <div className='wallets-list'>
            <div className='wallets-list-header'>
                <h2 className='title'>My Wallets</h2>
                <button onClick={() => history.push('/wallets/export')} className='btn'>
                    <IconDownload />
                </button>
                <button onClick={toggle} className='btn'>
                    <IconAdd />
                </button>
            </div>
            <Scrollbars renderThumbVertical={(props) => <div {...props} className='thumb-vertical' />}>
                {wallets &&
                wallets.map((wallet) => <Wallet wallet={wallet} key={wallet.address} isCurrent={isCurrent(wallet)} />)}
            </Scrollbars>
            <WalletModal isShowing={isShowing} hide={toggle} disableCloseButton={disableCloseButton}></WalletModal>
        </div>
    );
}

export default Wallets;
