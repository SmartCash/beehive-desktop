import React, { useContext } from 'react';
import Header from './Header';
import Wallets from './Wallets';
import WalletsBalance from './WalletsBalance';
import PasswordModal from './PasswordModal';
import { WalletContext } from '../context/WalletContext';

function Page({ children, className }) {
    const { masterKey } = useContext(WalletContext);
    if (!masterKey) {
        return <PasswordModal />;
    }
    return (
        <React.Fragment>
            <Header />
            <div className="main">
                <div className="sidebar">
                    <WalletsBalance />
                    <Wallets />
                </div>
                <div className={`page ${className}`}>{children}</div>
            </div>
        </React.Fragment>
    );
}

export default Page;
