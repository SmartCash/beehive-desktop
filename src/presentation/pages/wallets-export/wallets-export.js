import Page from 'presentation/components/Page';
import React, { useContext, useState } from 'react';
import styles from './wallets-export.module.scss';
import useModal from 'application/hooks/useModal';
import { PasswordModal } from 'presentation/components/password-modal/passsword-modal';
import { tryToDecryptAES } from 'application/lib/sapi';
import generatePDF from 'application/lib/GeneratorPDF';
import { WalletContext } from 'application/context/WalletContext';

export function WalletsExport() {
    const [accept, setAccept] = useState(false);
    const { wallets } = useContext(WalletContext);
    const { isShowing, toggle } = useModal();

    function downloadWallets(password) {
        const walletsShadowClone = JSON.parse(JSON.stringify(wallets));

        for (let wallet of walletsShadowClone) {
            wallet.privateKey = tryToDecryptAES({ textToDecrypt: wallet.privateKey, password });
        }

        generatePDF({ wallets: walletsShadowClone, filename: `BeeHive_USB_Backup_${Date.now()}` });
        toggle();
    }

    return (
        <Page className={styles.root}>
            <div className={styles.page}>
                <h1>Export BeeHive Wallets</h1>
                <p>The next screen will allow you to save an unencrypted backup file.</p>
                <div className={styles.wrapper}>
                    <input id='accept' type='checkbox' onChange={(event) => setAccept(event.target.checked)} />
                    <label htmlFor='accept'>
                        I understand that this needs to be saved on a USB drive and not on my computer.
                    </label>
                </div>
                <button className={styles.btn} disabled={!accept} onClick={toggle}>Export</button>
            </div>
            {isShowing && <PasswordModal callBack={downloadWallets} isShowing={isShowing} onClose={toggle} />}
        </Page>
    );
}
