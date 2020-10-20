import React, { useContext, useState } from 'react';
import Page from '../../components/Page';
import './Receive.css';
import QRious from "qrious";
import { WalletContext } from '../../context/WalletContext';

function Receive() {
    const { walletSelected } = useContext(WalletContext);
    const [amount, setAmount ] = useState(0);
    const qrAddress = new QRious({
        background: "#ffffff",
        foreground: "black",
        level: "L",
        size: "190",
        value: `smartcash:${walletSelected.address}?amount=${amount}`
    });
    return (
        <Page className='page-receive'>
            <div className='qrcode'>
                <img src={qrAddress.toDataURL("image/png")} alt="" />
            </div>
            <div className='form-group'>
                <div className='form-control address'>
                    <label htmlFor="addressTo">Send funds to address</label>
                    <input id="addressTo" value={walletSelected.address} readOnly={true} />
                </div>
                <div className='form-control fiat'>
                    <label htmlFor="fiat">Fiat</label>
                    <select id="fiat">
                        <option>Smart</option>
                    </select>
                </div>
                <div className='form-control amount'>
                    <label htmlFor="amount">Amount</label>
                    <input id="amount" value={amount} onInput={event => setAmount(event.target.value)} />
                </div>
            </div>
        </Page>
    )
}

export default Receive;
