import React, { useContext, useState } from 'react';
import style from '../wallet-modal.module.css';
import { generatePhrase, getFromDerivationPaths, validatePhrase } from '../../../lib/smart-mnemonic';
import generatePDF from '../../../lib/GeneratorPDF';
import { WalletContext } from '../../../context/WalletContext';
import { createRSAKeyPair } from '../../../lib/sapi';
import * as CryptoJS from 'crypto-js';
const { ipcRenderer } = window.require('electron');

export function Mnemonic({ hide }) {
    const [words, setWords] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [passphraseError, setPassphraseError] = useState('');
    const [accept, setAccept] = useState(false);
    const { decryptWallets, wallets, updateWalletsFunc } = useContext(WalletContext);

    const handleGenerateRandomMnemonic = async (words, passphrase) => {
        const generatedWallets = getFromDerivationPaths({ words, passphrase });

        const walletsGenerated = generatedWallets.BIP_44.addresses.map((_address) => {
            const { address, privkey } = _address;
            return {
                address,
                privateKey: privkey,
                RSA: createRSAKeyPair(passphrase),
                balance: {
                    locked: 0,
                    total: 0,
                    unlocked: 0,
                },
            };
        });

        generatePDF({ wallets: walletsGenerated, filename: `SmartCash_Address_${Date.now()}`, mnemonic: words, passphrase });

        const _wallets = [...wallets, ...walletsGenerated];

        const encryptedWallet = CryptoJS.AES.encrypt(JSON.stringify(_wallets), passphrase).toString();
        await ipcRenderer.send('setWalletData', encryptedWallet);

        updateWalletsFunc(_wallets);

        hide();
    };

    const passphraseValidation = async (event) => {
        setPassphrase(event.target?.value);
        const wallets = await decryptWallets(event.target?.value);

        if (!wallets) {
            setPassphraseError('Invalid passphrase');
        } else {
            setPassphraseError('');
        }
    };

    const buttonDisabled = () => !validatePhrase({ words }) || !passphrase || passphraseError || !accept;

    return (
        <div className={style.import_address}>
            <div>
                <div>
                    <textarea placeholder="BIP39 Mnemonic" value={words} onChange={(event) => setWords(event.target?.value)} />
                </div>
                <div>
                    <button className={[style.btn, style.btn_outline].join(' ')} onClick={() => setWords(generatePhrase())}>
                        Generate
                    </button>
                </div>
                <div>{words && !validatePhrase({ words }) && <p>Invalid mnemonic words</p>}</div>
            </div>
            <div>
                <textarea placeholder="Passphrase" onChange={passphraseValidation} />
                {passphraseError && <p>{passphraseError}</p>}
            </div>
            <div className={style.accept}>
                <input id="accept" type="checkbox" onChange={(event) => setAccept(event.target.checked)} />
                <label htmlFor="accept">I confirm that I have stored my mnemonic</label>
            </div>
            <button
                disabled={buttonDisabled()}
                className={style.btn}
                onClick={() => handleGenerateRandomMnemonic(words, passphrase)}
            >
                Import
            </button>
        </div>
    );
}
