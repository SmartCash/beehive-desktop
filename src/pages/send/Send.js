import React, { useContext, useState } from 'react';
import Page from '../../components/Page';
import './Send.css';
import { SendContext, SendProvider } from './SendContext';
import MaskedInput from 'react-text-mask';

function SendComponent() {
    const {
        amountToSend,
        setAmountToSend,
        amountToSendError,
        currencyMask,
        setAddressToSend,
        addressToSendError,
        netFee,
        totalInSmart,
        submitSendAmount,
        isSmartFiat,
        calcSendFounds,
        canSend,
        TXID,
        walletCurrent,
        walletCurrentBalance
    } = useContext(SendContext);

    if (TXID) {
        return (
            <Page className="page-send">
                <div className="hasBeenSent">
                    <p>Amount has been sent</p>
                    <a href={`https://explorer.smartcash.org/#/tx/${TXID}`} target="_blank" rel="noopener noreferrer">
                        {TXID}
                        <small>(click to view details)</small>
                    </a>
                </div>
            </Page>
        );
    }

    return (
        <Page className="page-send">
            <div className="form-control privateKey">
                <p>Wallet Selected <span>{walletCurrent}</span></p>
                <p>Balance: <span>{walletCurrentBalance}</span></p>
            </div>
            <div className="form-group">
                <div className="form-control address">
                    <label htmlFor="addressTo">Send funds to address</label>
                    <input
                        id="addressTo"
                        placeholder="Insert address here"
                        autoComplete="off"
                        type="text"
                        onInput={(event) => setAddressToSend(event.target.value)}
                    />
                    {addressToSendError && <p className="invalidAddress">Invalid address</p>}
                </div>
                {/* <div className="form-control fiat">
                    <label htmlFor="fiat">Fiat</label>
                    <select id="fiat" onInput={handleSelectedFiat}>
                        <option value="smart">smart</option>
                        {fiatList?.map((currencie) => (
                            <option key={currencie} value={currencie}>
                                {currencie}
                            </option>
                        ))}
                    </select>
                </div> */}
                <div className="form-control amount">
                    <label htmlFor="amount">Amount to send</label>
                    <MaskedInput
                        mask={currencyMask}
                        id="amount"
                        value={amountToSend}
                        onInput={(event) => setAmountToSend(event.target.value)}
                        autoComplete="off"
                    />
                    {amountToSendError && <p className="amountToSendError">{amountToSendError}</p>}
                </div>
                {isSmartFiat() && (
                    <div className="form-control amount">
                        <label>Quantity to send</label>
                        <button type="button" onClick={() => calcSendFounds(0.25)}>
                            1/4
                        </button>
                        <button type="button" onClick={() => calcSendFounds(0.5)}>
                            Half
                        </button>
                        <button type="button" onClick={() => calcSendFounds(1)}>
                            All
                        </button>
                    </div>
                )}
                {!isSmartFiat() && (
                    <div className="form-control amountInSmart">
                        <label htmlFor="receveInSmart">In SMART</label>
                        <input id="receveInSmart" value={0} readOnly={true} />
                    </div>
                )}
            </div>
            {netFee && (
                <div className="transactionInfo">
                    <div>
                        <p className="label">Net fee</p>
                        <p className="value">{netFee}</p>
                    </div>
                    <div>
                        <p className="label">Total in Smart</p>
                        <p className="value">{totalInSmart}</p>
                    </div>
                </div>
            )}
            <button type="submit" onClick={() => submitSendAmount()} disabled={!canSend()}>
                Send
            </button>
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
