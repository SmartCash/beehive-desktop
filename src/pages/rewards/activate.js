import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { sumFloats, subtractFloats } from '../../lib/math';
import { createAndSendRawTransaction, calculateFee, getTxId, getUnspent, getRewards } from '../../lib/sapi';
import style from './activate.module.css';
import Countdown from 'react-countdown';
import Page from '../../components/Page';
import { WalletContext } from '../../context/WalletContext';

function RewardsActivate() {
    const { wallets, walletCurrent: address } = useContext(WalletContext);
    const [activating, setActivating] = useState(false);
    const [rewards, setRewards] = useState();
    const [isActive, setIsActive] = useState(false);
    const [rewardsError, setRewardsError] = useState(false);
    const { privateKey, balance} = wallets && wallets.find(wallet => wallet.address === address);
    const [countDownDate, setCountDownDate] = useState(0);

    const { register, handleSubmit, errors, setError, setValue, formState } = useForm({
        mode: 'onChange',
    });

    useEffect(() => {
        setRewards(null);
        setRewardsError(false);
        getRewards(address).then(data => setRewards(data)).catch(() => setRewardsError(true));
    }, [address]);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const onSubmit = async (data) => {
        setActivating(true);
        setCountDownDate(Date.now() + 300000);

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

    if (rewardsError || balance < 1000) {
        return (
            <Page className="page-rewards">
                <div className={style['wrapper']}>
                    The address {address} is not eligible for rewards.
                </div>
            </Page>
        );
    }

    if (isActive === false && activating) {
        return (
            <Page className="page-rewards">
                <div className={style['wrapperActivating']}>
                    <img
                        src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
                        width="25px"
                        height="25px"
                    />
                    <p>
                        <Countdown date={countDownDate} />
                    </p>
                    <p>Activating rewards for the address {address}.</p>
                    <p>This can take a while, do not reload this page.</p>
                </div>
            </Page>
        );
    }

    return (
        <Page className="page-rewards">
            {isActive && (
                <div className={style['wrapper']}>
                    <p>Rewards are already activated for this address {address}</p>
                </div>
            )}
            {rewards && rewards.activated === 1 && isActive === false && (
                <div className={style['wrapper']}>
                    <div className={style['wrapper']}>
                        <p>Rewards are already activated for this address {address}</p>
                        <p>Balance Eligible: {rewards.balance_eligible}</p>
                        <p>Bonus level: {rewards.bonus_level}</p>
                    </div>
                </div>
            )}
            {rewards && rewards.activated === 0 && isActive === false && (
                <div className={style['wrapper']}>
                    <p>The rewards is not activated for the address {address}</p>
                    <form onSubmit={handleSubmit(onSubmit)} className="formGroup" autoComplete="off">
                        <button type="submit">
                            Activate Rewards
                        </button>
                    </form>
                </div>
            )}
        </Page>
    );
}

export default RewardsActivate;
