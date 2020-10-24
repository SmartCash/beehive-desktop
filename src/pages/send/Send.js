import React, { useContext } from 'react';
import Page from '../../components/Page';
import './Send.css';
import { WalletContext } from '../../context/WalletContext';
import { SendContext, SendProvider } from './SendContext';
import MaskedInput from 'react-text-mask';

function SendComponent() {
    const { walletCurrent, fiatList } = useContext(WalletContext);
    const { amountToSend, setAmountToSend, currencyMask, setAddressToSend, addressToSendError } = useContext(SendContext);
    return (
        <Page className="page-send">
            <div className="form-control privateKey">
                <label htmlFor="privateKey">Private Key from {walletCurrent.address}</label>
                <input id="privateKey" placeholder="Insert Private Key here" defaultValue={walletCurrent.privateKey} />
            </div>
            <div className="form-group">
                <div className="form-control address">
                    <label htmlFor="addressTo">Send funds to address</label>
                    <input
                        id="addressTo"
                        placeholder="Insert address here"
                        autoComplete="off"
                        onInput={(event) => setAddressToSend(event.target.value)}
                    />
                    {addressToSendError && <p className="invalidAddress">Invalid address</p>}
                </div>
                <div className="form-control fiat">
                    <label htmlFor="fiat">Fiat</label>
                    <select id="fiat">
                        <option value="smart">smart</option>
                        {fiatList?.map((currencie) => (
                            <option key={currencie} value={currencie}>
                                {currencie}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-control amount">
                    <label htmlFor="amount">Amount</label>
                    <MaskedInput mask={currencyMask} id="amount" onInput={(event) => setAmountToSend(event.target.value)} />
                    <button type="button">1/4</button>
                    <button type="button">Half</button>
                    <button type="button">All</button>
                </div>
            </div>
            <div className="transactionInfo">
                <div>
                    <p className="label">Net fee</p>
                    <p className="value">0.001</p>
                </div>
                <div>
                    <p className="label">Total in Smart</p>
                    <p className="value">100.001</p>
                </div>
            </div>
            <button type="submit">Send</button>
        </Page>
    );
}

const Send = () => {
    return (
        <SendProvider>
            <SendComponent />
        </SendProvider>
    );
};

export default Send;
