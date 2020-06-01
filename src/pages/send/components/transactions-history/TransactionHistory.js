import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import style from "./TransactionHistory.module.css";
import { getTransactionHistory } from "../../../../lib/sapi";

const TransactionsHistory = ({ isShowing, hide, address }) => {
  const [history, setHistory] = useState();

  useEffect(() => {
    async function _getTransactionHistory() {
      await getTransactionHistory(address)
        .then((data) => {
          data = JSON.parse(data);
          setHistory(data?.txs);
        })
        .catch((error) => console.error(error));
    }
    _getTransactionHistory();
  }, [address]);

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
                <strong>Transactions</strong>
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
                Showing last 5 transactions.
                <a
                  href={`https://insight.smartcash.cc/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  See all
                </a>
                {history?.map((tx, index) => {
                  return (
                    <div className={style.cardWrapper} key={index}>
                      <strong>Type</strong>
                      <p>{tx.direction}</p>
                      <strong>Fees</strong>
                      <p>{tx.fees}</p>
                      <strong>Amount</strong>
                      <p>{tx.amount}</p>
                      <strong>Transaction Id</strong>
                      <p>{tx.txid}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </React.Fragment>,
        document.body
      )
    : null;
};

export default TransactionsHistory;
