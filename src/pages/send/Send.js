import React, { useContext } from 'react';
import Page from '../../components/Page';
import './Send.css';
import { SendContext, SendProvider } from './SendContext';
import MaskedInput from 'react-text-mask';
import Scrollbars from 'react-custom-scrollbars';
import { ReactComponent as IconCopy } from '../../assets/images/copy.svg';
import { debounce } from 'lodash';
const electron = window.require('electron');

function SendComponent() {
    const {
        amountToSend,
        setAmountToSend,
        amountToSendError,
        currencyMask,
        addressToSend,
        setAddressToSend,
        setPassword,
        password,
        addressToSendError,
        netFee,
        totalInSmart,
        submitSendAmount,
        isSmartFiat,
        calculateSendAll,
        calculateSendAmount,
        canSend,
        TXID,
        walletCurrent,
        walletCurrentBalance,
        clearTxId,
        messageToSend,
        setMessageToSend,
        onHandleChange,
        TXIDError,
    } = useContext(SendContext);

    const setAmountToSendDebounced = debounce(value => setAmountToSend(value), 1500);

    if (walletCurrentBalance === 0) {
        return (
            <Page className="page-send">
                <div className="form-control privateKey">
                    <p>
                        Sending from <span>{walletCurrent} </span>
                        <button
                            className="btn copy"
                            title="Copy address to clipboard"
                            onClick={() => electron.clipboard.writeText(walletCurrent)}
                        >
                            <IconCopy className="btnCopy" />
                        </button>
                    </p>
                    <p>
                        Balance <span>{walletCurrentBalance.unlocked}</span>
                    </p>
                    <p>
                        Locked <span>{walletCurrentBalance.locked}</span>
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
            <Scrollbars renderThumbVertical={(props) => <div {...props} className="thumb-vertical" />}>
                {TXIDError && <p className="SendError">{TXIDError}</p>}

                {TXID && (
                    <div className="hasBeenSent">
                        <button className="btnClose" onClick={() => clearTxId()}>
                            X
                        </button>
                        <p>Amount has been sent</p>
                        <button onClick={() => electron.shell.openExternal(`http://explorer.smartcash.cc/tx/${TXID}`)}>
                            {TXID}
                            <small>(click to view details)</small>
                        </button>
                    </div>
                )}
                <div className="form-control privateKey">
                    <p>
                        Sending from <span>{walletCurrent} </span>
                        <button
                            className="btn copy"
                            title="Copy address to clipboard"
                            onClick={() => electron.clipboard.writeText(walletCurrent)}
                        >
                            <IconCopy className="btnCopy" />
                        </button>
                    </p>
                    <p>
                        Balance <span>{walletCurrentBalance?.unlocked}</span>
                    </p>
                    <p>
                        Locked <span>{walletCurrentBalance?.locked}</span>
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
                            value={addressToSend}
                            onInput={(event) => setAddressToSend(event.target.value.trim())}
                        />
                        {addressToSendError && <p className="invalidAddress">Invalid address</p>}
                    </div>

                    <div className="form-control amount">
                        <label htmlFor="amount">Amount to send</label>
                        <MaskedInput
                            mask={currencyMask}
                            id="amount"
                            value={amountToSend}
                            onInput={(event) => setAmountToSendDebounced(event.target.value)}
                            autoComplete="off"
                        />
                        {amountToSendError && <p className="amountToSendError">{amountToSendError}</p>}
                    </div>

                    {isSmartFiat() && (
                        <div className="form-control amount">
                            <button type="button" onClick={() => calculateSendAll(1)}>
                                Send All
                            </button>
                        </div>
                    )}

                    <div className="form-control message">
                        <label htmlFor="message">Write your message</label>
                        <input
                            id="messageTo"
                            placeholder="Insert message here"
                            autoComplete="off"
                            type="text"
                            value={messageToSend}
                            onInput={(event) => {
                                setMessageToSend(event.target.value);
                                calculateSendAmount(event.target.value);
                            }}
                        />
                    </div>

                    <div className="form-control message">
                        <label htmlFor="message">Password</label>
                        <input
                            id="messageTo"
                            placeholder="Insert your password here"
                            autoComplete="off"
                            type="password"
                            value={password}
                            onInput={(event) => {
                                setPassword(event.target.value);
                            }}
                        />
                    </div>
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

export function Send() {
    return (
        <SendProvider>
            <SendComponent />
        </SendProvider>
    );
}
