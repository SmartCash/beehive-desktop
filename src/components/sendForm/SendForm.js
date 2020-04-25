import React, { useState } from "react";
import { createAndSendRawTransaction, getFee } from "../../lib/sapi";
import { isAddress, isPK } from "../../lib/smart";
import style from "./SendForm.module.css";
import { useForm } from "react-hook-form";
import useModal from "../../util/useModal";
import Modal from "../modal/Modal";
import barcode from "../../assets/images/barcode.svg";

function Send({ address, balance }) {
  const { isShowing, toggle } = useModal(false);
  const [txid, setTxId] = useState();
  const [fee, setFee] = useState();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    errors,
    setError,
    setValue,
    clearError,
    formState,
  } = useForm({ mode: "onChange" });

  const onSubmit = (data) => {
    setLoading(true);
    createAndSendRawTransaction(
      data?.addressTo,
      Number(data?.amount),
      data?.privateKey
    )
      .then((data) => setTxId(data?.txid))
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    if (e?.target?.value > balance) {
      return setError("amount", "invalid", "Exceeds the balance");
    }
    if (e?.target?.value < 0.001) {
      return setError(
        "amount",
        "invalid",
        "The minimum amount to send is 0.001"
      );
    }
    getFee(Number(e?.target?.value), address)
      .then((data) => setFee(data))
      .catch((error) => {
        setError(console.log(error?.error[0]?.message));
        setFee();
      });
  };

  if (txid) {
    return (
      <div className={style.amountWasSent}>
        <p>Amount has been sent</p>
        <a
          href={`https://insight.smartcash.cc/tx/${txid}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {txid}
          <small>(click to view details)</small>
        </a>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="formGroup"
        autoComplete="off"
      >
        <div className="formControl">
          <label>
            Address to send
            <input
              type="text"
              name="addressTo"
              ref={register({ required: true })}
              onInput={(e) => {
                isAddress(e.target.value)
                  .then((data) => clearError("addressTo"))
                  .catch((error) => {
                    setError("addressTo", "invalid", "Invalid address");
                  });
              }}
            />
          </label>
          <button type="button" className="modalButton" onClick={toggle}>
            <img className="barCode" src={barcode} alt="Barcode" />
          </button>
          <Modal
            isShowing={isShowing}
            hide={toggle}
            setValue={(key, value) => setValue(key, value)}
          />
          {errors.addressTo && (
            <span className="error-message">{errors.addressTo.message}</span>
          )}
        </div>
        <div className="formControl">
          <label>
            Amount to send
            <input
              type="text"
              name="amount"
              ref={register({ required: true })}
              onInput={handleChange}
            />
          </label>
          {errors.amount && (
            <span className="error-message">{errors.amount.message}</span>
          )}
        </div>
        {fee && <div className={style.fee}>Fee: {fee}</div>}
        <div className="formControl">
          <label>
            Your Private Key
            <input
              type="text"
              name="privateKey"
              ref={register({ required: true })}
              onChange={(e) => {
                clearError("privateKey");
                isPK(e.target.value)
                  .then((data) => null)
                  .catch((error) => {
                    setError("privateKey", "invalid", "Invalid Private Key");
                  });
              }}
            />
          </label>
          {errors.privateKey && (
            <span className="error-message">{errors.privateKey.message}</span>
          )}
        </div>
        <button type="submit" disabled={loading || !formState.isValid}>
          Send
        </button>
      </form>
    </>
  );
}

export default Send;
