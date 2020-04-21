import React, { useMemo } from "react";
import barcode from "../../assets/images/barcode.svg";
import useModal from "../../util/useModal";
import Modal from "../modal/Modal";
import style from "./Input.module.css";

function Input({ label, value, onChange, showModal = false, setAmount }) {
  const ModalButton = () => {
    const { isShowing, toggle } = useModal(false);
    return (
      <>
        <button type="button" className={style.modalButton} onClick={toggle}>
          <img className={style.barCode} src={barcode} alt="Barcode" />
        </button>
        <Modal isShowing={isShowing} hide={toggle} onChange={onChange} setAmount={setAmount} />
      </>
    );
  };

  return useMemo(() => {
    return (
      <div className={style.formControl}>
        <label className={style.label}>
          {label}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
        {showModal ? <ModalButton /> : null}
      </div>
    );
  }, [label, onChange, showModal, value]);
}

export default Input;
