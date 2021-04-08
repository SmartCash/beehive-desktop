import { WalletContext } from 'application/context/WalletContext';
import React, { useContext } from 'react';
import { ReactComponent as IconDownload } from 'presentation/assets/images/download.svg';
import useModal from 'application/hooks/useModal';
import { PasswordModal } from '../password-modal/passsword-modal';
import generatePDF from 'application/lib/GeneratorPDF';
import { tryToDecryptAES } from 'application/lib/sapi';

export function ButtonDownloadWallets() {
    const { wallets } = useContext(WalletContext);
    const { isShowing, toggle } = useModal();

    function downloadWallets(password) {
        const walletsShadowClone = JSON.parse(JSON.stringify(wallets))

        for (let wallet of walletsShadowClone) {
            wallet.privateKey = tryToDecryptAES({ text: wallet.privateKey, password })
        }

        generatePDF({ wallets: walletsShadowClone, filename: `MyWallets_SmartCash_${Date.now()}` });
        toggle();
    }

    return (
        <>
            <button onClick={toggle} className="btn">
                <IconDownload />
            </button>
            {isShowing && <PasswordModal callBack={downloadWallets} isShowing={isShowing} onClose={toggle} />}
        </>
    );
}
