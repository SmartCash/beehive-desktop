import useDebounce from 'application/hooks/useDebounce';
import { WalletContext } from 'application/context/WalletContext';
import { ReactComponent as IconCopy } from 'presentation/assets/images/copy.svg';
import Page from 'presentation/components/Page';
import React, { useContext, useEffect } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import MaskedInput from 'react-text-mask';
import useModal from 'application/hooks/useModal';
import { PasswordModal } from 'presentation/components/password-modal/passsword-modal';
import './Send.css';
import { SendContext, SendProvider } from './SendContext';
import loader from 'presentation/assets/images/loader.svg';

const electron = window.require('electron');

function SendComponent() {
    const {
        amountToSend,
        setAmountToSend,
        checkAmounToSendError,
        amountToSendError,
        currencyMask,
        addressToSend,
        setAddressToSend,
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
        TXIDError,
        TXIDLoading
    } = useContext(SendContext);

    const debouncedAmount = useDebounce(amountToSend, 1500);
    const { isShowing: showPasswordModal, toggle: togglePasswordModal } = useModal();
    const { password, setPassword } = useContext(WalletContext);

    useEffect(() => {
        if (debouncedAmount) {
            checkAmounToSendError(debouncedAmount);
        }
    }, [debouncedAmount]);

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

    function getPass(){
        return password;
    }

    function send(){
        var pass = getPass();

        if(!pass){
            togglePasswordModal();
        } else{
            submitSendAmount(pass)
        }        
    }

    const handleSend = (pass, saveInContext) => {
        if(saveInContext)
            setPassword(pass);             
        
        submitSendAmount(pass)
        togglePasswordModal();
    }  

    return (
        <Page className="page-send">
            <Scrollbars renderThumbVertical={(props) => <div {...props} className="thumb-vertical" />}>
                {TXIDLoading && (
                    <p className="loading">
                        <img src={loader} alt={'loading...'} />
                    </p>
                )}
                
                {!TXIDLoading && (
                    <>
                        
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
                        Balance{' '}
                        <span>
                            {walletCurrentBalance?.unlocked
                                .toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 4,
                                })
                                .replace('$', '∑')}
                        </span>
                    </p>
                    <p>
                        Locked{' '}
                        <span>
                            {walletCurrentBalance?.locked
                                .toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 4,
                                })
                                .replace('$', '∑')}
                        </span>
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
                            onInput={(event) => setAmountToSend(event.target.value)}
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
                </div>
                {netFee && (
                    <div className="transactionInfo">
                        <div>
                            <p className="label">Net fee</p>
                            <p className="value">
                                {netFee
                                    .toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 4,
                                    })
                                    .replace('$', '∑')}
                            </p>
                        </div>
                        <div>
                            <p className="label">Total in Smart</p>
                            <p className="value">
                                {totalInSmart
                                    .toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 4,
                                    })
                                    .replace('$', '∑')}
                            </p>
                        </div>
                    </div>
                )}
                <button type="submit" onClick={() => send()} disabled={!canSend()}>
                    Send
                </button>           
                </>
                )}         
                 </Scrollbars>

                {
                    showPasswordModal && (
                        <PasswordModal
                            callBack={handleSend}
                            isShowing={showPasswordModal}
                            onClose={togglePasswordModal}
                        />
                    )
                } 
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
