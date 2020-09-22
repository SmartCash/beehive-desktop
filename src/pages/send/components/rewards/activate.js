import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import barcode from '../../../../assets/images/barcode.svg';
import { subtractFloats } from '../../../../lib/math';
import { createAndSendRawTransaction, getBalance, getRewards, getTxId, getUnspent } from '../../../../lib/sapi';
import { isPK } from '../../../../lib/smart';
import useModal from '../../../../util/useModal';
import Modal from '../modal/Modal';

function RewardsActivate({ address, privateKey, balance: _balance, rewards: _rewards }) {
    let timer;
    const { isShowing, toggle } = useModal(false);
    const [loading, setLoading] = useState(false);
    const [activating, setActivating] = useState(false);
    const [type, setType] = useState();
    const [rewards, setRewards] = useState(_rewards);
    const [balance, setBalance] = useState(_balance);

    const { register, handleSubmit, errors, setError, setValue, formState } = useForm({
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        const unspents = await getUnspent(address);
        if (unspents.utxos.length === 1) {
            await SendTransaction(data).then((data) => checkTxId(data?.txid));
        } else if (unspents.utxos.length > 1) {
            await SendTransaction(data);
            await SendTransaction(data).then((data) => checkTxId(data?.txid));
        }
    };

    const SendTransaction = (_data) => {
        setLoading(true);
        const amount = subtractFloats(balance, 0.001).toFixed(8);
        return createAndSendRawTransaction(address, amount, String(privateKey || _data?.privateKey)).then(async (data) => {
            await getBalance(address).then((res) => setBalance(res.balance));
            return data;
        });
    };

    const checkTxId = async (_txid) => {
        setActivating(true);
        const txid = await getTxId(_txid);
        if (txid.confirmations >= 1) {
            clearTimeout(timer);
            getRewards(address).then((_data) => {
                setRewards(_data.data);
                if (_data.data.activated === 1) {
                    setActivating(false);
                }
            });
            return;
        }
        timer = setTimeout(() => checkTxId(_txid), 55000);
    };

    if (rewards && rewards.activated === 0 && activating) {
        return (
            <div className="wrapper">
                <p>Activating your Rewards.</p>
                <p>This can take a while, do not reload this page.</p>
            </div>
        );
    }

    return (
        <>
            {rewards && rewards.activated === 1 && (
                <div className="wrapper">
                    <p>Activated: {rewards.activated ? 'Yes' : 'No'}</p>
                    <p>Eligible to Rewards: {rewards.eligible ? 'Yes' : 'No'}</p>
                    <p>Balance Eligible: {String(rewards.balance_eligible)}</p>
                </div>
            )}
            {rewards && rewards.activated === 0 && (
                <div className="wrapper">
                    <p>Your wallet is not eligible to Rewards, put your Private Key to activate.</p>
                    <form onSubmit={handleSubmit(onSubmit)} className="formGroup" autoComplete="off">
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
                                                        setError('privateKey', {
                                                            message: 'Invalid Private Key',
                                                            shouldFocus: false,
                                                        });
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
                                {errors.privateKey && <span className="error-message">{errors.privateKey.message}</span>}
                            </div>
                        ) : null}
                        <button type="submit" disabled={loading || !formState.isValid}>
                            Activate Rewards
                        </button>
                    </form>
                </div>
            )}

            <Modal
                isShowing={isShowing}
                hide={toggle}
                callback={(obj) => {
                    if (type === 'privateKey') {
                        obj.address && setValue('privateKey', obj.address, true);
                    }
                }}
            />
        </>
    );
}

export default RewardsActivate;
