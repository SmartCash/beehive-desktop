import React, { useContext } from 'react';
import Page from '../../components/Page';
import './Send.css';
import { SendContext, SendProvider } from './SendContext';
import MaskedInput from 'react-text-mask';
import Scrollbars from 'react-custom-scrollbars';
const electron = window.require('electron');

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
        walletCurrentBalance,
        clearTxId
    } = useContext(SendContext);

    if (walletCurrentBalance === 0) {
        return (
            <Page className="page-send">
                <div className="form-control privateKey">
                    <p>
                        Sending from <span>{walletCurrent}</span>
                    </p>
                    <p>
                        Balance <span>{walletCurrentBalance}</span>
                    </p>
                </div>
                <div className="walletEmpty">
                    <p>This wallet is empty</p>
                </div>
            </Page>
        );
    }

    return (
        <Page className="page-send">
            <Scrollbars>
                {TXID && (
                    <div className="hasBeenSent">
                        <button className="btnClose" onClick={() => clearTxId()}>X</button>
                        <p>Amount has been sent</p>
                        <button onClick={() => electron.shell.openExternal(`http://explorer.smartcash.org/tx/${TXID}`)}>
                            {TXID}
                            <small>(click to view details)</small>
                        </button>
                    </div>
                )}
                <div className="form-control privateKey">
                    <p>
                        Sending from <span>{walletCurrent}</span>
                    </p>
                    <p>
                        Balance <span>{walletCurrentBalance}</span>
                    </p>
                </div>
                <div className="form-group">
                    <div className="form-control address">
                        <label htmlFor="addressTo">Send funds to address</label>
                        <input
                            id="addressTo"
                            placeholder="Insert address here"
                            autoComplete="off"
                            type="text"
                            onInput={(event) => {
                                event.target.value = event.target.value.trim();
                                setAddressToSend(event.target.value);
                            }}
                        />
                        {addressToSendError && <p className="invalidAddress">Invalid address</p>}
                    </div>
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
                            <button type="button" onClick={() => calcSendFounds(1)}>
                                Send All
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
                            <p className="value">{totalInSmart.toFixed(8)}</p>
                        </div>
                    </div>
                )}
                <button type="submit" onClick={() => submitSendAmount()} disabled={!canSend()}>
                    Send
                </button>
            </Scrollbars>
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
