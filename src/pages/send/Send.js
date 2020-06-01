import React, { useState } from "react";
import style from "./Send.module.css";
import Header from "./components/header/Header";
import SendForm from "./components/sendForm/SendForm";
import { getBalance, getAddress, createNewWalletKeyPair } from "../../lib/sapi";
import { isAddress, isPK } from "../../lib/smart";
import { useForm } from "react-hook-form";
import useModal from "../../util/useModal";
import Modal from "./components/modal/Modal";
import barcode from "../../assets/images/barcode.svg";
import { NavLink } from "react-router-dom";
import generatePDF from "../export-private-keys/GeneratorPDF";
import TransactionsHistory from "./components/transactions-history/TransactionHistory";

function Send() {
  const { isShowing, toggle } = useModal(false);
  const [address, setAddress] = useState();
  const [privateKey, setPrivateKey] = useState();
  const [balance, setBalance] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const {
    register,
    errors,
    setError,
    setValue,
    formState,
    triggerValidation,
  } = useForm({
    mode: "onChange",
  });

  const getBalanceFromSAPI = (address) => {
    setBalance("Loading Balance");
    getBalance(address)
      .then((res) => setBalance(res.balance))
      .catch((error) => setBalance("Error loading balance"));
  };

  const AddressPKValidation = async (value) => {
    let isValid = false;

    await isAddress(value)
      .then((data) => {
        setAddress(data);
        getBalanceFromSAPI(data);
        isValid = true;
      })
      .catch((data) => data);

    await isPK(value)
      .then(() => {
        const address = getAddress(value);
        setAddress(address);
        setPrivateKey(value);
        getBalanceFromSAPI(address);
        isValid = true;
      })
      .catch((data) => data);

    if (!isValid) {
      setError("address", "invalid", "Invalid Address");
    }

    return isValid;
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
                name="address"
                autoComplete="off"
                ref={register({
                  required: true,
                  validate: AddressPKValidation,
                })}
                onInput={() => triggerValidation("addressTo")}
              />
            </label>
            <button type="button" className="modalButton" onClick={toggle}>
              <img className="barCode" src={barcode} alt="Barcode" />
            </button>
            <Modal
              isShowing={isShowing}
              hide={toggle}
              callback={(obj) =>
                obj.address && setValue("address", obj.address, true)
              }
            />
            {errors.address && (
              <span className="error-message">{errors.address.message}</span>
            )}
          </div>
        </div>
      </div>

      {formState.isValid ? (
        <div>
          <div className="container">
            <div className={style.btnWrapper}>
              <p>Your Balance: {balance}</p>
              <button
                className={style.btn}
                onClick={(e) => setShowTransactions(!showTransactions)}
              >
                Show Last Transactions
              </button>
            </div>
          </div>

          <TransactionsHistory
            address={address}
            isShowing={showTransactions}
            hide={() => setShowTransactions(false)}
          />

          <div className="container">
            <div className="cardWrapper">
              <SendForm
                address={address}
                balance={balance}
                privateKey={privateKey}
              />
            </div>
          </div>
        </div>
      ) : null}

      {!formState.isValid ? (
        <>
          <div className="container">
            <button
              className={`btn ${style.newAddress}`}
              onClick={() =>
                generatePDF([createNewWalletKeyPair()], "SmartCash_Address")
              }
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
