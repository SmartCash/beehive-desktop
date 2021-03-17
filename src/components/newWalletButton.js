import React from 'react';
import generatePDF from '../export-private-keys/GeneratorPDF';
import { createNewWalletKeyPair } from '../../lib/sapi';

function NewWalletButton() {
    return (
        <button
            className={`btn ${style.newAddress}`}
            onClick={() => generatePDF([createNewWalletKeyPair()], `SmartCash_Address_${Date.now()}`)}
        >
            Generate paper wallet
        </button>
    );
}

export default NewWalletButton;
