import React, { useCallback, useContext, useState } from 'react';
import Page from '../../components/Page';
import './Receive.css';
import QRious from 'qrious';
import { WalletContext } from '../../context/WalletContext';
import { getCurrenciePrice } from '../../lib/smart';

function Receive() {
    const { walletCurrent, fiatList } = useContext(WalletContext);
    const [amount, setAmount] = useState(0);
    const [rate, setRate] = useState();

    const calcAmountConverted = useCallback(() => {
        let currentValue = Number(amount);
        currentValue = currentValue / (rate || 1.0);
        return currentValue.toFixed(8);
    }, [amount, rate]);

    const handleSelectedFiat = async (e) => {
        const { value } = e.target;
        if (value) {
            await getCurrenciePrice(value).then((res) => setRate(res.smartcash[`${value}`]));
        }
    };

    const qrAddress = new QRious({
        background: '#ffffff',
        foreground: 'black',
        level: 'L',
        size: '190',
        value: `smartcash:${walletCurrent?.address}?amount=${calcAmountConverted()}`,
    });

    return (
        <Page className="page-receive">
            <div className="qrcode">
                <img src={qrAddress.toDataURL('image/png')} alt="" />
            </div>
            <div className="form-group">
                <div className="form-control address">
                    <label htmlFor="addressTo">Send funds to address</label>
                    <input id="addressTo" defaultValue={walletCurrent?.address} readOnly={true} />
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
                    <label htmlFor="amount">Amount to receive:</label>
                    <input id="amount" defaultValue={amount} onInput={(event) => setAmount(event.target.value)} />
                </div>
                <div className="form-control amountInSmart">
                    <label htmlFor="receveInSmart">In SMART</label>
                    <input id="receveInSmart" value={calcAmountConverted()} readOnly={true}/>
                </div>
            </div>
        </Page>
    );
}

export default Receive;
