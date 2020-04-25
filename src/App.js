import React, { useState } from "react";
import style from "./App.module.css";
import Header from "./components/header/Header";
import SendForm from "./components/sendForm/SendForm";
import { getBalance } from "./lib/sapi";
import { isAddress } from "./lib/smart";
import { useForm } from "react-hook-form";
import useModal from "./util/useModal";
import Modal from "./components/modal/Modal";
import barcode from "./assets/images/barcode.svg";

function App() {
  const { isShowing, toggle } = useModal(false);
  const [address, setAddress] = useState();
  const [validAddress, setValidAddres] = useState();
  const [balance, setBalance] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, errors, setError, setValue } = useForm({
    mode: "onChange",
  });

  const handleSetAddress = (address) => {
    setLoading(true);
    setAddress(address);
    getBalance(address)
      .then((res) => {
        setBalance(res.balance);
        setValidAddres(true);
      })
      .catch((error) => setValidAddres(false))
      .finally(() => setLoading(false));
  };

  return (
    <div className={style.root}>
      <Header />

      <div className="container">
        <div className="cardWrapper">
          <div className="formControl">
            <label>
              Your Address
              <input
                type="text"
                name="address"
                autoComplete="off"
                onInput={(e) => {
                  isAddress(e.target.value)
                    .then((data) => handleSetAddress(data))
                    .catch((error) => {
                      setError("address", "invalid", "Invalid address");
                    });
                }}
                ref={register({ required: true })}
              />
            </label>
            <button type="button" className="modalButton" onClick={toggle}>
              <img className="barCode" src={barcode} alt="Barcode" />
            </button>
            <Modal
              isShowing={isShowing}
              hide={toggle}
              setValue={(key, e) => setValue("address", e)}
            />
            {errors.address && (
              <span className="error-message">{errors.address.message}</span>
            )}
          </div>
          {loading && <span>Loading</span>}
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
