export function PrivateKeyImport() {
    const [privateKey, setPrivateKey] = useState();

    const insertPrivateKey = (event) => setPrivateKey(event.target.value);

    const handleImportPrivateKey = async () => {
        const wallets = await decryptWallets(_password);
        if ((wallets && wallets.length > 0) || disableCloseButton) {
            isPK(privateKey)
                .then(() => {
                    const _wallet = {
                        privateKey: CryptoJS.AES.encrypt(privateKey, _password).toString(),
                        address: getAddress(privateKey),
                    };
                    addWallet(_wallet, _password);
                    hide();
                })
                .catch(() => setError('Invalid Private Key'));
        } else {
            setError('Wallet is not  possible to decrypt using this password.');
        }
    };

    return (
        <div className={style['import-address']}>
            <h2>Import from Private Key</h2>
            <textarea onInput={insertPrivateKey} placeholder="Insert your private key here" rows={5} />
            <input type="password" placeholder="Password" onInput={(event) => setPassword(event.target.value)} />
            {error && <p>{error}</p>}
            <button onClick={handleImportPrivateKey}>Import</button>
            <button onClick={handleCreateNewOne}>Create new one</button>
        </div>
    );
}
