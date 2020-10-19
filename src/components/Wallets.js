import React, { useContext } from 'react';
import Wallet from './Wallet';
import { WalletContext } from '../context/WalletContext';
import { ReactComponent as IconAdd } from '../assets/images/add.svg';
import { Scrollbars } from 'react-custom-scrollbars';

function Wallets() {
    const { wallets, addWallet } = useContext(WalletContext);
    return (
        <div className="wallets-list">
            <div className="wallets-list-header">
                <h2 className="title">My Wallets</h2>
                <button onClick={addWallet} className="btn">
                    <IconAdd/>
                </button>
            </div>
            <Scrollbars>
            {
                wallets.map(wallet => <Wallet wallet={wallet}/>)
            }
            </Scrollbars>
        </div>
    );
}

export default Wallets;
