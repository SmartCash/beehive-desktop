import React, { useContext, useEffect, useState } from 'react';
import Wallet from './Wallet';
import { WalletContext } from '../context/WalletContext';
import { ReactComponent as IconAdd } from '../assets/images/add.svg';
import { ReactComponent as IconDownload } from '../assets/images/download.svg';
import { Scrollbars } from 'react-custom-scrollbars';
import useModal from '../hooks/useModal';
import WalletModal from './WalletModal';

function Wallets() {
    const { wallets, walletCurrent, password, downloadWallets } = useContext(WalletContext);
    const { isShowing, toggle } = useModal();
    const [disableCloseButton, setDisableCloseButton] = useState(false);

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
        <div className="wallets-list">
            <div className="wallets-list-header">
                <h2 className="title">My Wallets</h2>
                <button onClick={downloadWallets} className="btn">
                    <IconDownload />
                </button>
                <button onClick={toggle} className="btn">
                    <IconAdd />
                </button>
            </div>
            <Scrollbars renderThumbVertical={props => < div {...props} className="thumb-vertical"/>}>
                {wallets &&
                    wallets.map((wallet) => <Wallet wallet={wallet} key={wallet.address} isCurrent={isCurrent(wallet)} />)}
            </Scrollbars>
            <WalletModal isShowing={isShowing} hide={toggle} disableCloseButton={disableCloseButton}></WalletModal>
        </div>
    );
}

export default Wallets;
