import React, { useContext, useState } from 'react';
import style from '../wallet-modal.module.css';
import { generatePhrase, getFromDerivationPaths, validatePhrase } from '../../../lib/smart-mnemonic';
import generatePDF from '../../../lib/GeneratorPDF';
import { WalletContext } from '../../../context/WalletContext';
import * as CryptoJS from 'crypto-js';

export function Mnemonic({ hide }) {
    const [words, setWords] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [passphraseError, setPassphraseError] = useState('');
    const { addWallet, decryptWallets } = useContext(WalletContext);

    const handleGenerateRandomMnemonic = (words) => {
        if (passphraseError) {
            return;
        }

        words = words || generatePhrase();
        const generatedWallets = getFromDerivationPaths({words, passphrase});

        const wallets = generatedWallets.BIP_44.addresses.map(_address => {
            const { address, privkey } = _address;
            return {
                address,
                privateKey: privkey
            }
        });

        generatePDF({ wallets, filename: `SmartCash_Address_${Date.now()}`, mnemonic: words, passphrase });

        wallets.forEach(wallet => {
            const _wallet = {
                privateKey: CryptoJS.AES.encrypt(wallet.privateKey, passphrase).toString(),
                address: wallet.address,
            };
            addWallet(_wallet, passphrase);
        });

        hide();
    }

    const passphraseValidation = async (event) => {
        const wallets = await decryptWallets(event.target?.value);

        if (!wallets) {
            setPassphraseError('Invalid passphrase');
            return;
        }

        setPassphraseError('');
        setPassphrase(event.target?.value);
    }

    return (
        <div className={style.import_address}>
            <div>
                <textarea placeholder="BIP39 Mnemonic" onChange={(event) => setWords(event.target?.value)} />
                <p>{String(validatePhrase({ words }))}</p>
            </div>
            <div>
                <textarea placeholder="Passphrase" onChange={passphraseValidation}/>
                { passphraseError && <p>{passphraseError}</p>}
            </div>
            <button className={style.btn} onClick={() => handleGenerateRandomMnemonic(words)}>Import from mnemonic</button>

            <p>Or</p>

            <button className={[style.btn, style.btn_outline].join(' ')} onClick={() => handleGenerateRandomMnemonic(null)}>Generate a random mnemonic</button>
        </div>
    );
}
