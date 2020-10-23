import React, { useContext, useEffect, useState } from 'react';
import Wallet from './Wallet';
import { WalletContext } from '../context/WalletContext';
import { ReactComponent as IconAdd } from '../assets/images/add.svg';
import { Scrollbars } from 'react-custom-scrollbars';
import useModal from '../hooks/useModal';
import WalletModal from './WalletModal';

function Wallets() {
    const { wallets } = useContext(WalletContext);
    const { isShowing, toggle } = useModal();
    const [disableCloseButton, setDisableCloseButton] = useState(false);

    useEffect(() => {
        if (wallets.length === 0) {
            setDisableCloseButton(true);
            toggle();
        }
    }, []);

    return (
        <div className="wallets-list">
            <div className="wallets-list-header">
                <h2 className="title">My Wallets</h2>
                <button onClick={toggle} className="btn">
                    <IconAdd/>
                </button>
            </div>
            <Scrollbars>
            {
                wallets.map(wallet => <Wallet wallet={wallet} key={wallet.address}/>)
            }
            </Scrollbars>
            <WalletModal isShowing={isShowing} hide={toggle} disableCloseButton={disableCloseButton}></WalletModal>
        </div>
    );
}

export default Wallets;
