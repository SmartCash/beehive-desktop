import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import barcode from '../../../../assets/images/barcode.svg';
import { sumFloats, subtractFloats } from '../../../../lib/math';
import { createAndSendRawTransaction, calculateFee, getTxId, getUnspent } from '../../../../lib/sapi';
import { isPK } from '../../../../lib/smart';
import useModal from '../../../../util/useModal';
import Modal from '../modal/Modal';
import style from './activate.module.css';
import Countdown from 'react-countdown';

function RewardsActivate({ address, privateKey, rewards: _rewards }) {
    const { isShowing, toggle } = useModal(false);
    const [loading, setLoading] = useState(false);
    const [activating, setActivating] = useState(false);
    const [type, setType] = useState();
    const [rewards, setRewards] = useState(_rewards);
    const [isActive, setIsActive] = useState(false);

    const { register, handleSubmit, errors, setError, setValue, formState } = useForm({
        mode: 'onChange',
    });

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const onSubmit = async (data) => {
        setActivating(true);

        let _unspents, _amount, _balance, transactionId;

        const activeRewards = async () => {
            _unspents = await getUnspent(address);
            _amount = Number(sumFloats(_unspents.utxos.map((utxo) => utxo.value)).toFixed(8));
            _balance = subtractFloats(_amount, await calculateFee(_unspents.utxos));
            transactionId = await SendTransaction(Number(_balance.toFixed(8)), data.privateKey);
        };

        activeRewards();
        await sleep(60000 * 1.5);

        activeRewards();
        await sleep(60000 * 1.5);

        let transaction = await getTxId(transactionId.txid);
        let isActivated = transaction.vin.length === 1 && transaction.vout.length === 1;

        if (isActivated === true) {
            setIsActive(true);
            setActivating(false);
        }
    };

    const SendTransaction = (amount, _privateKey) => {
        return createAndSendRawTransaction(address, amount, privateKey || _privateKey);
    };

    if (isActive === false && activating) {
        return (
            <div className={style.wrapperActivating}>
                <img
                    src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
                    width="25px"
                    height="25px"
                />
                <p>
                    <Countdown date={Date.now() + 300000} />
                </p>
                <p>Activating your Rewards.</p>
                <p>This can take a while, do not reload this page.</p>
            </div>
        );
    }

    return (
        <>
            {isActive && (
                <div className="wrapper">
                    <p>Your Smart Rewards is active.</p>
                </div>
            )}
            {rewards && rewards.activated === 1 && isActive === false && (
                <div className="wrapper">
                    <div className="wrapper">
                        <p>Activated: {rewards.activated ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            )}
            {rewards && rewards.activated === 0 && isActive === false && (
                <div className="wrapper">
                    <p>Click in the button below to activate Smart Rewards.</p>
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
