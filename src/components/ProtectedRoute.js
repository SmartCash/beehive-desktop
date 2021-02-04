import React, { useContext } from 'react';
import { WalletContext } from '../context/WalletContext';
import PasswordModal from './PasswordModal';

function ProtectedRoute({ children }) {
    const { password } = useContext(WalletContext);

    if (!password) {
        return <PasswordModal />;
    }

    return children;
}

export default ProtectedRoute;
