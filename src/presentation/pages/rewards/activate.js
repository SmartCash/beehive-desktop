import { WalletContext } from 'application/context/WalletContext';
import { activateRewards, getRewards, getSpendableInputs, getTxId } from 'application/lib/sapi';
import { ReactComponent as IconLoading } from 'presentation/assets/images/loading.svg';
import SmartRewardsImage from 'presentation/assets/images/smart_rewards.png';
import SuperRewardsImage from 'presentation/assets/images/super_rewards.png';
import Page from 'presentation/components/Page';
import SmartNodeRewardsRoi from 'presentation/components/SmartNodeRewardsRoi';
import React, { useContext, useEffect, useState } from 'react';
import Countdown from 'react-countdown';
import { useForm } from 'react-hook-form';
import './activate.css';
import { ActivateContext, ActivateProvider } from './ActivateContext';
import useModal from 'application/hooks/useModal';
import { PasswordModal } from 'presentation/components/password-modal/passsword-modal';
import loader from 'presentation/assets/images/loader.svg';

function RewardsActivateComponent() {
    const { wallets, walletCurrent: address } = useContext(WalletContext);
    const { TXError } = useContext(ActivateContext);
    const { password, setPassword } = useContext(WalletContext);
    const { isShowing: showPasswordModal, toggle: togglePasswordModal } = useModal();

    const [activating, setActivating] = useState(false);
    const [rewards, setRewards] = useState();
    const [isActive, setIsActive] = useState(false);
    const [rewardsError, setRewardsError] = useState(false);
    const { privateKey, balance } = wallets.find((wallet) => wallet.address === address);
    const [countDownDate, setCountDownDate] = useState(0);
    const [loading, setLoading] = useState(true);

    const { handleSubmit, setError } = useForm({
        mode: 'onChange',
    });

    useEffect(() => {
        setLoading(true);
        setRewards(null);
        setRewardsError(false);
        getRewards(address)
            .then((data) => 
                setRewards(data),
                setLoading(false)
            )
            .catch(() => 
                setRewardsError(true),
                setLoading(false))
    }, [address]);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    function getPass(){
        return password;
    }

    function send(){
        var pass = getPass();

        if(!pass){
            togglePasswordModal();        
        } else{
            submitRewards(pass)
        }        
    }

    const handleSend = (pass, saveInContext) => {
        if(saveInContext)
            setPassword(pass);             
        
        submitRewards(pass);
        togglePasswordModal();
    }  

    async function submitRewards(pass) {
        const SLEEP_TIME = 1000;        
        setActivating(true);
        setCountDownDate(Date.now() + SLEEP_TIME);

        let unspentList = await getSpendableInputs(address);

        let rewardsActivationResponse = await activateRewards({ toAddress: address, unspentList, privateKey, pass });

        if (rewardsActivationResponse && rewardsActivationResponse.status === 400) {
            setError(rewardsActivationResponse.value);
            return rewardsActivationResponse;
        }

        await sleep(SLEEP_TIME);

        const transactionResponse = await getTxId(rewardsActivationResponse.value);

        if (!transactionResponse) {
            return {
                status: 400,
                value: 'Error to broadcast the transaction',
            };
        }
        rewards.activated = 1;
        setCountDownDate(0);
        setRewards(rewards);
        setIsActive(true);
        setActivating(false);

        return {
            status: 200,
            value: transactionResponse.txid,
        };        
    };

    {
        TXError && <p className="SendError">{TXError}</p>;
    }

    if (rewardsError || balance.unlocked < 999) {
        return (
            <Page className="page-rewards">
                {loading && (
                    <p className="loading">
                        <img src={loader} alt={'loading...'} />
                    </p>
                )}

                {!loading && (                    
                    <div className="wrapper">
                        The address <span className="text-primary">{address}</span> is not eligible for rewards.
                    </div>                    
                )}

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
            {loading && (
                <p className="loading">
                    <img src={loader} alt={'loading...'} />
                </p>
            )}

            {!loading && (
                <div>
                    {isActive && (
                        <div className="wrapper"><p>Rewards are already activated for this address <span className="text-primary">{address}</span></p></div>
                    )}
                    
                    {rewards && rewards.activated === 1 && isActive === false && (
                        <div className="wrapper">
                            <div className="wrapper">
                                <p>
                                    Rewards are already activated for this address <span className="text-primary">{address}</span>
                                </p>
                                <p>
                                    Balance Eligible:{' '}
                                    <span className="text-primary">
                                        {rewards.balance_eligible
                                            .toLocaleString('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                                minimumFractionDigits: 4,
                                            })
                                            .replace('$', '∑')}
                                    </span>
                                </p>
                                <p>
                                    Bonus level: <span className="text-primary">{rewards.bonus_level}</span>
                                </p>
                                <div>
                                    {rewards.activated && rewards.balance_eligible > 999 && rewards.balance_eligible < 999999 && (
                                        <img src={SmartRewardsImage} className="rewardsImg" />
                                    )}
                                    {rewards.activated && rewards.balance_eligible >= 999999 && (
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

                                <div className="form-not-activated">
                                    {/* <input
                                        id="messageTo"
                                        placeholder="Insert your password here"
                                        autoComplete="off"
                                        type="password"
                                        value={password}
                                        onInput={(event) => {
                                            setPassword(event.target.value);
                                        }}
                                    /> */}
                                    <button type="submit" onClick={() => send()}>
                                        Activate Rewards
                                    </button>
                                </div>
                            </div>                
                    )}

                    <SmartNodeRewardsRoi />
                </div>                       
            )}                        
            
            {showPasswordModal && (
                <PasswordModal
                    callBack={handleSend}
                    isShowing={showPasswordModal}
                    onClose={togglePasswordModal}
                />
            )} 
        </Page>
    );
}

//export default RewardsActivate;

export function RewardsActivate() {
    return (
        <ActivateProvider>
            <RewardsActivateComponent />
        </ActivateProvider>
    );
}
