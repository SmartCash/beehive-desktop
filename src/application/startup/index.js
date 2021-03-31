import { WalletProvider } from 'application/context/WalletContext';
import { Routes } from 'application/routes';
import HttpsRedirect from 'presentation/components/RedirectToHttps';
import React from 'react';

export function Startup() {
    return (
        <HttpsRedirect>
            <WalletProvider>
                <Routes />
            </WalletProvider>
        </HttpsRedirect>
    );
}
