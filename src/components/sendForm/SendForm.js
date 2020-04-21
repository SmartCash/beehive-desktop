import React, { useEffect, useState } from "react";
import { createAndSendRawTransaction, getFee } from "../../lib/sapi";
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
    if (amount > balance) {
      setError("Amount exceeds balance");
    } else if (Number(amount) < 0.001) {
      setError("Mininum amount to send is 0.001");
    } else {
      setError();
      setFee();
    }
    if (Boolean(amountDebounced) && address && !error) {
      getFee(Number(amountDebounced), address)
        .then((data) => setFee(data))
        .catch((error) => {
          setError(console.log(error?.error[0]?.message));
          setFee();
        });
    }
  }, [address, amount, amountDebounced, balance, error]);

  const handleOnSubmit = () => {
    createAndSendRawTransaction(addressTo, Number(amount), privateKey)
      .then((data) => setTxId(data?.txid))
      .catch((error) => console.error(error));
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
          value={addressTo}
          onChange={(e) => setAddressTo(e)}
          showModal={true}
        />
        <InputAmount
          label="Amount to send"
          onChange={setAmount}
          value={amount}
        />
        {fee && !error ? <div className={style.fee}>Fee: {fee}</div> : null}
        <Input
          label="Your Private Key"
          value={privateKey}
          onChange={(e) => setPrivateKey(e)}
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
