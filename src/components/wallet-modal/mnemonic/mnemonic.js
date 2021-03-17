import React from 'react';
import style from '../wallet-modal.module.css';

export function Mnemonic({ hide }) {
    const handleGeneratePrivateKey = () => {
        hide();
    };

    return (
        <div className={style.import_address}>
            <div>
                <textarea placeholder="BIP39 Mnemonic" />
            </div>
            <div>
                <textarea placeholder="BIP39 Passphrase (optional)" />
            </div>
            <button className={[style.btn, style.btn_outline].join(' ')}>Generate a random mnemonic</button>
            <button className={style.btn} onClick={handleGeneratePrivateKey}>Generate</button>
        </div>
    );
}
