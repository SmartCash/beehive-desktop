import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import QRious from "qrious";
import useAxios from "axios-hooks";
import style from "./Receive.module.css";

const Receive = ({ isShowing, hide, address }) => {
  const [amount, setAmount] = useState(0);
  const [qrAddress, setQrAddress] = useState();
  const [rate, setRate] = useState();
  const [{ data: dataCurrencies }] = useAxios(
    "https://api.coingecko.com/api/v3/simple/supported_vs_currencies"
  );
  const [{}, refetchCurrencyValue] = useAxios(
    "https://api.coingecko.com/api/v3/simple/price?ids=smartcash&vs_currencies=usd,btc"
  );

  const calcAmountConverted = useCallback(() => {
    let currentValue = Number(amount);
    currentValue = currentValue / (rate || 1.0);
    return currentValue.toFixed(8);
  }, [amount, rate]);

  const handleSelectedFiat = async (e) => {
    const { value } = e.target;
    if (value) {
      await refetchCurrencyValue({
        params: { vs_currencies: value },
      }).then((res) => {
        setRate(res.data.smartcash[`${value}`]);
      });
    }
  };

  const getQrCodeUrl = useCallback(() => {
    const url = `smartcash:${address}`;
    if (calcAmountConverted() === 0) {
      return url;
    } else {
      return url + "?amount=" + calcAmountConverted();
    }
  }, [address, calcAmountConverted]);

  useEffect(() => {
    setQrAddress(
      new QRious({
        background: "#ffffff",
        foreground: "black",
        level: "L",
        size: "150",
        value: getQrCodeUrl(),
      })
    );
  }, [address, getQrCodeUrl]);

  return isShowing
    ? ReactDOM.createPortal(
        <React.Fragment>
          <div className={style["modal-overlay"]} />
          <div
            className={style["modal-wrapper"]}
            aria-modal
            aria-hidden
            tabIndex={-1}
            role="dialog"
          >
            <div className={style["modal"]}>
              <div className={style["modal-header"]}>
                <strong>Receive</strong>
                <button
                  type="button"
                  className={style["modal-close-button"]}
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={hide}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className={style["modal-body"]}>
                <div>
                  <img
                    src={qrAddress.toDataURL("image/png")}
                    className={style.qrCode}
                  />
                </div>
                <div>Receive: {calcAmountConverted()} SMARTS</div>
                <div>
                  <select onInput={handleSelectedFiat}>
                    <option value="">Select a FIAT</option>
                    <option value="smart">smart</option>
                    {dataCurrencies.map((currency, index) => {
                      return (
                        <option value={currency} key={index}>
                          {currency}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    type="text"
                    onInput={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>,
        document.body
      )
    : null;
};

export default Receive;
