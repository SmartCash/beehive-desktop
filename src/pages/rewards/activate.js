import React, { useContext, useEffect, useState } from 'react';
import Countdown from 'react-countdown';
import { useForm } from 'react-hook-form';
import { ReactComponent as IconLoading } from '../../assets/images/loading.svg';
import SmartRewardsImage from '../../assets/images/smart_rewards.png';
import SuperRewardsImage from '../../assets/images/super_rewards.png';
import Page from '../../components/Page';
import SmartNodeRewardsRoi from '../../components/SmartNodeRewardsRoi';
import { WalletContext } from '../../context/WalletContext';
import { subtractFloats, sumFloats } from '../../lib/math';
import {
    calculateFee,
    createAndSendRawTransaction,
    getRewards,
    getTxId,
    getSpendableInputs,
    activateRewards,
} from '../../lib/sapi';
import './activate.css';

function RewardsActivate() {
    const { wallets, walletCurrent: address } = useContext(WalletContext);
    const [activating, setActivating] = useState(false);
    const [rewards, setRewards] = useState();
    const [isActive, setIsActive] = useState(false);
    const [rewardsError, setRewardsError] = useState(false);
    const { privateKey, balance } = wallets.find((wallet) => wallet.address === address);
    const [countDownDate, setCountDownDate] = useState(0);

    const { register, handleSubmit, errors, setError, setValue, formState } = useForm({
        mode: 'onChange',
    });

    useEffect(() => {
        setRewards(null);
        setRewardsError(false);
        getRewards(address)
            .then((data) => setRewards(data))
            .catch(() => setRewardsError(true));
    }, [address]);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const onSubmit = async (data) => {
        // setActivating(true);
        // setCountDownDate(Date.now() + 300000);

        let unspentList = await getSpendableInputs(address);

        let rewardsActivationResponse = await activateRewards({ toAddress: address, unspentList, privateKey });

        if (rewardsActivationResponse && rewardsActivationResponse.status === 400) {
            setError(rewardsActivationResponse.value);
            return rewardsActivationResponse;
        }

        await sleep(10 * 1000);

        const transactionResponse = await getTxId(rewardsActivationResponse.value);

        if (!transactionResponse) {
            return {
                status: 400,
                value: 'Error to broadcast the transaction',
            };
        }

        setIsActive(true);
        // setActivating(false);

        return {
            status: 200,
            value: transactionResponse.txid,
        };
    };

    if (rewardsError || balance < 1000) {
        return (
            <Page className="page-rewards">
                <div className="wrapper">
                    The address <span className="text-primary">{address}</span> is not eligible for rewards.
                </div>
                <SmartNodeRewardsRoi />
            </Page>
        );
    }

    if (isActive === false && activating) {
        return (
            <Page className="page-rewards">
                <div className="wrapperActivating">
                    <IconLoading className="wrapperActivatingLoading" />
                    <p>
                        <Countdown date={countDownDate} />
                    </p>
                    <p>
                        Activating rewards for the address <span className="text-primary">{address}</span>.
                    </p>
                    <p>This can take a while, do not reload this page.</p>
                </div>
            </Page>
        );
    }

    return (
        <Page className="page-rewards">
            {isActive && (
                <div className="wrapper">
                    <p>
                        Rewards are already activated for this address <span className="text-primary">{address}</span>
                    </p>
                </div>
            )}
            {rewards && rewards.activated === 1 && isActive === false && (
                <div className="wrapper">
                    <div className="wrapper">
                        <p>
                            Rewards are already activated for this address <span className="text-primary">{address}</span>
                        </p>
                        <p>
                            Balance Eligible: <span className="text-primary">{rewards.balance_eligible}</span>
                        </p>
                        <p>
                            Bonus level: <span className="text-primary">{rewards.bonus_level}</span>
                        </p>
                        <div>
                            {rewards.activated && rewards.balance_eligible > 1000 && rewards.balance_eligible < 1000000 && (
                                <img src={SmartRewardsImage} className="rewardsImg" />
                            )}
                            {rewards.activated && rewards.balance_eligible >= 1000000 && (
                                <img src={SuperRewardsImage} className="rewardsImg" />
                            )}
                        </div>
                    </div>
                </div>
            )}
            {rewards && rewards.activated === 0 && isActive === false && (
                <div className="wrapper">
                    <p>
                        The rewards is not activated for the address <span className="text-primary">{address}</span>
                    </p>
                    <form onSubmit={handleSubmit(onSubmit)} className="formGroup" autoComplete="off">
                        <button type="submit">Activate Rewards</button>
                    </form>
                </div>
            )}
            <SmartNodeRewardsRoi />
        </Page>
    );
}

export default RewardsActivate;
