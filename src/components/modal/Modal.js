import React from "react";
import ReactDOM from "react-dom";
import QrReader from "react-qr-reader";
import style from "./Modal.module.css";

const Modal = ({ isShowing, hide, onChange }) => {
  const handleScan = (data) => {
    if (data) {
      hide();
      onChange(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

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
                <QrReader
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
        </React.Fragment>,
        document.body
      )
    : null;
};

export default Modal;
