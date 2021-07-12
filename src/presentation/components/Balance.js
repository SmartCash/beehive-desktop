import { WalletContext } from 'application/context/WalletContext';
import React, { useContext } from 'react';

export function Balance(balance) {
    const { hideBalance } = useContext(WalletContext);

    return (
        <>
            {hideBalance && (
                balance.value?.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 4,
                })
                    .replace('$', '∑') || 0
            )}

            {!hideBalance && ('∑ *******')}
        </>
    );
}
