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
  const [balance, setBalance] = useState(false);
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
                ref={register({
                  required: true,
                  validate: async (value) => {
                    let isValid = false;
                    await isAddress(value)
                      .then((data) => {
                        setAddress(data);
                        getBalanceFromSAPI(data);
                        isValid = true;
                      })
                      .catch((error) =>
                        setError("address", "invalid", "Invalid Address")
                      );
                    return isValid;
                  },
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
