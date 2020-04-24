import React, { useEffect, useState } from "react";
import { createAndSendRawTransaction, getFee } from "../../lib/sapi";
import { isAddress, isPK } from "../../lib/smart";
import useDebounce from "../../util/useDebounce";
import InputAmount from "../input-amount/InputAmount";
import Input from "../input/Input";
import style from "./SendForm.module.css";

function Send({ address, balance }) {
  const [addressTo, setAddressTo] = useState();
  const [amount, setAmount] = useState();
  const [privateKey, setPrivateKey] = useState();
  const [fee, setFee] = useState();
  const [txid, setTxId] = useState();
  const amountDebounced = useDebounce(amount, 500);
  const [error, setError] = useState();

  useEffect(() => {
    if (amountDebounced) {
      if (amountDebounced > balance) {
        return setError("Amount exceeds balance");
      }

      if (Number(amountDebounced) < 0.001) {
        return setError("Mininum amount to send is 0.001");
      }

      setError();

      getFee(Number(amountDebounced), address)
        .then((data) => setFee(data))
        .catch((error) => {
          setError(console.log(error?.error[0]?.message));
          setFee();
        });
    } else {
      setError();
      setFee();
    }
  }, [address, amountDebounced, balance]);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    createAndSendRawTransaction(addressTo, Number(amount), privateKey)
      .then((data) => setTxId(data?.txid))
      .catch((error) => console.error(error));
  };

  const handleAddressTo = (e) => {
    isAddress(e)
      .then((data) => {
        setAddressTo(e);
        setError();
      })
      .catch((error) => setError("Invalid Address To"));
  };

  const handlePrivateKey = (e) => {
    isPK(e)
      .then((data) => {
        setPrivateKey(e);
        setError();
      })
      .catch((error) => setError("Invalid Private Key"));
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
      <form onSubmit={handleOnSubmit}>
        {error ? <div className={style.alertWarning}>{error}</div> : null}
        <Input
          label="Address to send"
          initialValue={addressTo}
          onChange={handleAddressTo}
          setAmount={setAmount}
          showModal={true}
        />
        <InputAmount
          label="Amount to send"
          initialValue={amount}
          onChange={setAmount}
        />
        {fee && !error ? <div className={style.fee}>Fee: {fee}</div> : null}
        <Input
          label="Your Private Key"
          initialValue={privateKey}
          onChange={handlePrivateKey}
          showModal={true}
        />
        <button
          type="submit"
          className={style.btnSend}
          disabled={error ? "disabled" : null}
        >
          Send
        </button>
      </form>
    </>
  );
}

export default Send;
