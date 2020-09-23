import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import barcode from '../../assets/images/barcode.svg';
import { createNewWalletKeyPair, getAddress, getBalance, getRewards, getTransactionHistory } from '../../lib/sapi';
import { isAddress, isPK } from '../../lib/smart';
import useModal from '../../util/useModal';
import generatePDF from '../export-private-keys/GeneratorPDF';
import Header from './components/header/Header';
import Modal from './components/modal/Modal';
import RewardsActivate from './components/rewards/activate';
import SendForm from './components/sendForm/SendForm';
import TransactionsHistory from './components/transactions-history/TransactionHistory';
import style from './Send.module.css';

function Send() {
    const { isShowing, toggle } = useModal(false);
    const [address, setAddress] = useState();
    const [privateKey, setPrivateKey] = useState();
    const [balance, setBalance] = useState();
    const [history, setHistory] = useState();
    const [rewards, setRewards] = useState();
    const { register, errors, setError, setValue, formState } = useForm({
        mode: 'onChange',
    });

    const getBalanceFromSAPI = (address) => {
        setBalance('Loading Balance');
        getBalance(address)
            .then((res) => setBalance(res.balance))
            .catch((error) => setBalance('Error loading balance'));
    };

    const AddressPKValidation = async (value) => {
        let isValid = false;

        await isAddress(value)
            .then((data) => {
                setAddress(data);
                getBalanceFromSAPI(data);
                getTransactionHistory(data).then((data) => setHistory(data));
                getRewards(data).then((data) => setRewards(data));
                isValid = true;
            })
            .catch((data) => data);

        await isPK(value)
            .then(() => {
                const address = getAddress(value);
                setAddress(address);
                setPrivateKey(value);
                getBalanceFromSAPI(address);
                getTransactionHistory(address).then((data) => setHistory(data));
                getRewards(address).then((data) => setRewards(data));
                isValid = true;
            })
            .catch((data) => data);

        if (!isValid) {
            setError('address', { message: 'Invalid address', shouldFocus: false });
        }

        return isValid;
    };

    const [tabActive, setTabActive] = useState(0);
    const handleTabClick = (e) => {
        const index = parseInt(e.target.id, 0);
        if (index !== tabActive) {
            setTabActive(index);
        }
    };

    return (
        <div className={style.root}>
            <Header />
            <div className="container">
                <div className="cardWrapper">
                    <div className="formControl">
                        <label>
                            Your Address or Private Key
                            <input
                                type="text"
                                id="address"
                                name="address"
                                autoComplete="off"
                                ref={register({
                                    required: true,
                                    validate: AddressPKValidation,
                                })}
                            />
                        </label>
                        <button type="button" className="modalButton" onClick={toggle}>
                            <img className="barCode" src={barcode} alt="Barcode" />
                        </button>
                        <Modal
                            isShowing={isShowing}
                            hide={toggle}
                            callback={(obj) => obj.address && setValue('address', obj.address, true)}
                        />
                        {errors.address && <span className="error-message">{errors.address.message}</span>}
                    </div>
                </div>
            </div>
            <div>
                <div className="container">
                    <div className={style.btnWrapper}>
                        <p>Your Balance: {Number(balance || 0).toFixed(8)}</p>
                    </div>

                    <div className={style.tabWrapper}>
                        <button onClick={handleTabClick} id={0}>
                            Send
                        </button>
                        <button onClick={handleTabClick} id={1}>
                            Transactions
                        </button>
                        {rewards && (
                            <button onClick={handleTabClick} id={2}>
                                Rewards
                            </button>
                        )}
                    </div>

                    {tabActive === 0 && (
                        <div className="cardWrapper">
                            <SendForm address={address} balance={balance} privateKey={privateKey} />
                        </div>
                    )}
                    {tabActive === 1 && (
                        <div className="cardWrapper">
                            <TransactionsHistory address={address} history={history} />
                        </div>
                    )}
                    {tabActive === 2 && (
                        <div className="cardWrapper">
                            <RewardsActivate address={address} balance={balance} privateKey={privateKey} rewards={rewards} />
                        </div>
                    )}
                </div>
            </div>

            {!formState.isValid ? (
                <>
                    <div className="container">
                        <button
                            className={`btn ${style.newAddress}`}
                            onClick={() => generatePDF([createNewWalletKeyPair()], 'SmartCash_Address')}
                        >
                            Generate paper wallet
                        </button>
                    </div>
                </>
            ) : null}
        </div>
    );
}

export default Send;
