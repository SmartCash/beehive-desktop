import React, { useContext } from 'react';
import Header from './Header';
import Wallets from './Wallets';
import WalletsBalance from './WalletsBalance';

function Page({ children, className }) {
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
