import React, { useCallback, useContext, useEffect, useState } from 'react';
import Page from '../../components/Page';
import './Receive.css';
import QRious from 'qrious';
import { WalletContext } from 'application/context/WalletContext';
import { getCurrenciePrice } from 'application/lib/smart';
import { Scrollbars } from 'react-custom-scrollbars';
import { saveAs } from 'file-saver';
import { ReactComponent as IconDownload } from '../../assets/images/fileDownload.svg';
import { ReactComponent as IconCopy } from '../../assets/images/copy.svg';
import { Partners } from 'presentation/components/partners/partners';
const electron = window.require('electron');

function Receive() {
    const { walletCurrent, fiatList } = useContext(WalletContext);
    const [amount, setAmount] = useState(0);
    const [fiatSelected, setFiatSelected] = useState('smart');
    const [rate, setRate] = useState();

    const calcAmountConverted = useCallback(() => {
        let currentValue = Number(amount);
        currentValue = currentValue / (rate || 1.0);
        return currentValue.toFixed(8);
    }, [amount, rate]);

    const handleSelectedFiat = async (e) => {
        const { value } = e.target;
        if (value) {
            setFiatSelected(value);
            await getCurrenciePrice(value).then((res) => setRate(res.smartcash[`${value}`]));
        }
    };

    const qrAddress = new QRious({
        background: '#ffffff',
        foreground: 'black',
        level: 'L',
        size: '190',
        value: `smartcash:${walletCurrent}?amount=${calcAmountConverted()}`,
    });

    const isFiatSmart = () => {
        return fiatSelected === 'smart';
    };

    return (
        <Page className="page-receive">
            <Scrollbars>
                <div className="qrcode">
                    <img src={qrAddress.toDataURL('image/png')} alt="" title="Copy QR Code image and download the QR Code image" />
                    <div className="btnWrapper">
                        <div className="btnIcon">
                            <button
                                className="btn"
                                title="Download Image"
                                onClick={async () => {
                                    const base64Response = await fetch(qrAddress.toDataURL('image/png'));
                                    const blob = await base64Response.blob();
                                    saveAs(blob, 'SendMeSmartCash.png');
                                }}
                            >
                                <IconDownload className="btnCopy" />
                                <p className="descIcon">Download the QR Code image</p>
                            </button>
                           
                        </div>

                        <div className="btnIcon">
                            <button
                                className="btn copy"
                                title="Copy QRCode to clipboard"
                                onClick={() => {
                                    electron.clipboard.writeImage(
                                        electron.nativeImage.createFromDataURL(qrAddress.toDataURL('image/png'))
                                    );
                                }}
                            >
                                <IconCopy className="btnCopy" />
                                <p className="descIcon">Copy QR Code image</p>
                            </button>
                            
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="form-control address">
                        <label htmlFor="addressTo">Send funds to address</label>
                        <input id="addressTo" value={walletCurrent} readOnly={true} />
                        <button
                            className="btn copy"
                            title="Copy address to clipboard"
                            onClick={() => electron.clipboard.writeText(walletCurrent)}
                        >
                            <IconCopy className="btnCopy" />
                        </button>
                    </div>
                    <div className="form-control fiat">
                        <label htmlFor="fiat">Fiat</label>
                        <select id="fiat" onInput={handleSelectedFiat}>
                            <option value="smart">Smart</option>
                            {fiatList?.map((currencie) => (
                                <option key={currencie} value={currencie}>
                                    {currencie}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-control amount">
                        <label htmlFor="amount">Amount to receive {!isFiatSmart() && `in (${fiatSelected})`}:</label>
                        <input id="amount" defaultValue={amount} onInput={(event) => setAmount(event.target.value)} />
                    </div>
                    {!isFiatSmart() && (
                        <div className="form-control amountInSmart">
                            <label htmlFor="receveInSmart">Amount to receive in SMART</label>
                            <input id="receveInSmart" value={calcAmountConverted()} readOnly={true} />
                        </div>
                    )}
                </div>
                <div className="partnersWrap">
                    <Partners />
                </div>
            </Scrollbars>
        </Page>
    );
}

export default Receive;
