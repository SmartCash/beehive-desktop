import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import MaskedInput from 'react-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import barcode from '../../../../assets/images/barcode.svg';
import { subtractFloats, sumtractFloats } from '../../../../lib/math';
import { createAndSendRawTransaction, getFee } from '../../../../lib/sapi';
import { isAddress, isPK } from '../../../../lib/smart';
import useDebounce from '../../../../util/useDebounce';
import useModal from '../../../../util/useModal';
import Modal from '../modal/Modal';
import style from './SendForm.module.css';

const defaultMaskOptions = {
    prefix: '',
    suffix: '',
    includeThousandsSeparator: true,
    thousandsSeparatorSymbol: '',
    allowDecimal: true,
    decimalSymbol: '.',
    decimalLimit: 8, // how many digits allowed after the decimal
    integerLimit: 30, // limit length of integer numbers
    allowNegative: false,
    allowLeadingZeroes: false,
};
const currencyMask = createNumberMask(defaultMaskOptions);

function Send({ address, balance, privateKey, withdraw }) {
    const { isShowing, toggle } = useModal(false);
    const [amount, setAmount] = useState();
    const [txid, setTxId] = useState();
    const [fee, setFee] = useState();
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState();
    const debouncedAmount = useDebounce(amount, 1000);

    const { control, register, handleSubmit, errors, setError, setValue, formState, trigger, getValues } = useForm({
        mode: 'onChange',
        defaultValues: {
            amount: withdraw ? Number(balance - 0.002) : null,
        },
    });

    useEffect(() => {
        if (debouncedAmount) {
            getFeeFromSAPI(debouncedAmount);
        }
    }, [debouncedAmount]);

    const onSubmit = (data) => {
        setLoading(true);
        createAndSendRawTransaction(data?.addressTo, Number(data?.amount), String(privateKey || data?.privateKey))
            .then((data) => setTxId(data?.txid))
            .catch((error) => setError(error[0]?.message))
            .finally(() => setLoading(false));
    };

    const getFeeFromSAPI = (amount) => {
        getFee(Number(amount), address).then((fee) => {
            setFee(fee);
        });
    };

    const handleSendAllFunds = async () => {
        const amount = subtractFloats(balance, 0.001).toFixed(8);
        setValue('amount', amount, true);
        setAmount(amount);
    };

    if (txid) {
        return (
            <div className={style.amountWasSent}>
                <p>Amount has been sent</p>
                <a href={`https://insight.smartcash.cc/tx/${txid}`} target="_blank" rel="noopener noreferrer">
                    {txid}
                    <small>(click to view details)</small>
                </a>
                <button type="button" onClick={() => window.location.reload()}>
                    Refresh Page
                </button>
            </div>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="formGroup" autoComplete="off">
                <div className="formControl">
                    <label>
                        Address to send
                        <input
                            type="text"
                            name="addressTo"
                            ref={register({
                                required: true,
                                validate: async (value) => {
                                    let isValid = false;
                                    await isAddress(value)
                                        .then((data) => {
                                            isValid = true;
                                        })
                                        .catch((error) => {
                                            setError('addressTo', { shouldFocus: false });
                                        });
                                    return isValid;
                                },
                            })}
                            onInput={() => trigger('addressTo')}
                        />
                    </label>
                    <button
                        type="button"
                        className="modalButton"
                        onClick={() => {
                            toggle();
                            setType('address');
                        }}
                    >
                        <img className="barCode" src={barcode} alt="Barcode" />
                    </button>
                    {errors.addressTo && <span className="error-message">Invalid address</span>}
                </div>
                <div className="formControl">
                    <label>
                        Amount to send
                        <Controller
                            as={MaskedInput}
                            mask={currencyMask}
                            type="text"
                            name="amount"
                            control={control}
                            rules={{
                                required: true,
                                validate: (value) => {
                                    if (value >= balance) {
                                        setError('amount', { message: 'Exceeds balance', shouldFocus: false });
                                        return false;
                                    }
                                    if (value < 0.001) {
                                        setError('amount', {
                                            message: 'The minimum amount to send is 0.001',
                                            shouldFocus: false,
                                        });
                                        return false;
                                    }
                                    setAmount(value);
                                },
                            }}
                            onInput={() => trigger('amount')}
                        ></Controller>
                    </label>
                    {balance > 0.003 && (
                        <button type="button" className="sendAllFunds" onClick={() => handleSendAllFunds()}>
                            Send All
                        </button>
                    )}
                    {errors?.amount && <span className="error-message">{errors?.amount?.message}</span>}
                </div>

                {fee && !errors.amount && (
                    <div className={style.fee}>
                        <p>Fee: {fee}</p>
                        <p className={style.requestedAmount}>Requested Amount: {sumtractFloats(getValues('amount'), 0.001)}</p>
                    </div>
                )}
                {!privateKey ? (
                    <div className="formControl">
                        <label>
                            Your Private Key
                            <input
                                type="text"
                                name="privateKey"
                                defaultValue={privateKey}
                                ref={register({
                                    required: true,
                                    validate: async (value) => {
                                        let isValid = false;
                                        await isPK(value)
                                            .then((data) => (isValid = true))
                                            .catch((error) => {
                                                setError('privateKey', { message: 'Invalid Private Key', shouldFocus: false });
                                            });
                                        return isValid;
                                    },
                                })}
                            />
                        </label>
                        <button
                            type="button"
                            className="modalButton"
                            onClick={() => {
                                toggle();
                                setType('privateKey');
                            }}
                        >
                            <img className="barCode" src={barcode} alt="Barcode" />
                        </button>
                        {errors?.privateKey && <span className="error-message">{errors?.privateKey?.message}</span>}
                    </div>
                ) : null}
                <button type="submit" disabled={loading || !formState.isValid}>
                    Send
                </button>
            </form>
            <Modal
                isShowing={isShowing}
                hide={toggle}
                callback={(obj) => {
                    if (type === 'address') {
                        obj.address && setValue('addressTo', obj.address, true);
                        obj.amount && setValue('amount', obj.amount, true);
                    }
                    if (type === 'privateKey') {
                        obj.address && setValue('privateKey', obj.address, true);
                    }
                }}
            />
        </>
    );
}

export default Send;
