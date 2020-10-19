import React, { useContext } from 'react';
import Page from '../../components/Page';
import './Send.css';
import { WalletContext } from '../../context/WalletContext';

function Send() {
    const { walletSelected } = useContext(WalletContext);
    return (
        <Page className='page-send'>
            <div className='form-control privateKey'>
                <label htmlFor="privateKey">Private Key from {walletSelected.address}</label>
                <input id="privateKey" placeholder="Insert Private Key here"/>
            </div>
            <div className='form-group'>
                <div className='form-control address'>
                    <label htmlFor="addressTo">Send funds to address</label>
                    <input id="addressTo" placeholder="Insert address here"/>
                </div>
                <div className='form-control fiat'>
                    <label htmlFor="fiat">Fiat</label>
                    <select id="fiat">
                        <option>Smart</option>
                    </select>
                </div>
                <div className='form-control amount'>
                    <label htmlFor="amount">Amount</label>
                    <input id="amount" />
                    <button type="button">1/4</button>
                    <button type="button">Half</button>
                    <button type="button">All</button>
                </div>
            </div>
            <div className='transactionInfo'>
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
    )
}

export default Send;
