import React, { useEffect, useState } from "react";
import getFeeFromSAPI from "../lib/sapi_fee";
import useDebounce from "../util/debounce";

function Send() {
  const [address, setAddress] = useState();
  const [addressTo, setAddressTo] = useState();
  const [amount, setAmount] = useState();
  const [privateKey, setPrivateKey] = useState();
  const [fee, setFee] = useState();
  const amountDebounced = useDebounce(amount, 500);

  const handleOnSubmit = () => {};

  useEffect(() => {
    if (amountDebounced) {
      getFeeFromSAPI(Number(amount), address)
        .then((data) => setFee(data))
        .catch((error) => console.log(error?.error[0]?.message));
    }
  }, [amountDebounced]);

  return (
    <form onSubmit={handleOnSubmit}>
      <div>
        <label>Your address</label>
        <input onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div>
        <label>Address to send</label>
        <input onChange={(e) => setAddressTo(e.target.value)} />
      </div>
      <div>
        <label>Amount to send</label>
        <input onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div>
        <label>Your Private Key</label>
        <input onChange={(e) => setPrivateKey(e.target.value)} />
      </div>
      <button type="submit"></button>
    </form>
  );
}

export default Send;
