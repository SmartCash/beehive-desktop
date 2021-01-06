import React, { useContext } from 'react';
import { WalletContext } from '../context/WalletContext';
import PasswordModal from './PasswordModal';

function ProtectedRoute({ children }) {
    const { masterKey } = useContext(WalletContext);

    if (!masterKey) {
        return <PasswordModal />;
    }

    return children;
}

export default ProtectedRoute;
