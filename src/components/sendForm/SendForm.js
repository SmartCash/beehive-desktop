import React, { useEffect, useState } from "react";
import { createAndSendRawTransaction, getFee } from "../../lib/sapi";
import useDebounce from "../../util/useDebounce";
import Input from "../input/Input";
import style from "./SendForm.module.css";

function Send({ address }) {
  const [addressTo, setAddressTo] = useState();
  const [amount, setAmount] = useState();
  const [privateKey, setPrivateKey] = useState();
  const [fee, setFee] = useState();
  const [rawTransaction, setRawTransaction] = useState();
  const amountDebounced = useDebounce(amount, 500);

  useEffect(() => {
    if (amountDebounced) {
      getFee(Number(amount), address)
        .then((data) => setFee(data))
        .catch((error) => console.log(error?.error[0]?.message));
    }
  }, [address, amount, amountDebounced]);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    createAndSendRawTransaction(addressTo, amount, privateKey)
      .then((data) => setRawTransaction(data))
      .catch((error) => console.error(error));
  };

  if (rawTransaction) {
    return (
      <>
        <p>Founds sended, transaction id: </p>
      </>
    );
  }

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <Input
          label="Address to send"
          value={addressTo}
          onChange={(e) => setAddressTo(e)}
          showModal={true}
        />
        <Input label="Amount to send" onChange={setAmount} model={amount} />
        {fee ? <div className={style.fee}>Fee: {fee}</div> : null}
        <Input
          label="Your Private Key"
          value={privateKey}
          onChange={(e) => setPrivateKey(e)}
          showModal={true}
        />
        <button type="submit" className={style.btnSend}>
          Send
        </button>
      </form>
    </>
  );
}

export default Send;
