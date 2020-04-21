import React, { useEffect, useState } from "react";
import style from "./App.module.css";
import Header from "./components/header/Header";
import Input from "./components/input/Input";
import SendForm from "./components/sendForm/SendForm";
import { getBalance } from "./lib/sapi";
import useDebounce from "./util/useDebounce";

function App() {
  const [address, setAddress] = useState();
  const [validAddress, setValidAddres] = useState();
  const [balance, setBalance] = useState(false);
  const addressDebounced = useDebounce(address, 500);

  useEffect(() => {
    if (addressDebounced && address) {
      handleSetAddress(address);
    } else {
      setValidAddres(false);
    }
  }, [address, addressDebounced]);

  const handleSetAddress = (address) => {
    getBalance(address)
      .then((res) => {
        setBalance(res.balance);
        setValidAddres(true);
      })
      .catch((error) => setValidAddres(false));
  };

  return (
    <div className={style.root}>
      <Header />

      <div className="container">
        <div className="cardWrapper">
          <Input
            label="Your Address"
            value={address}
            onChange={(e) => setAddress(e)}
            showModal={true}
          />
        </div>
      </div>

      {validAddress ? (
        <div>
          <div className="container">
            <div className={style.btnWrapper}>
              <p>Your Balance: {balance}</p>
              <a
                className={style.btn}
                href={`https://insight.smartcash.cc/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Show Transactions
              </a>
            </div>
          </div>

          <div className="container">
            <div className="cardWrapper">
              <SendForm address={address} balance={balance} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
