import React, { useMemo, useRef } from "react";
import barcode from "../../assets/images/barcode.svg";
import useModal from "../../util/useModal";
import Modal from "../modal/Modal";
import style from "./Input.module.css";

function Input({
  label,
  initialValue,
  onChange,
  showModal = false,
  setAmount,
}) {
  const inputEl = useRef(initialValue);

  const ModalButton = () => {
    const { isShowing, toggle } = useModal(false);
    return (
      <>
        <button type="button" className={style.modalButton} onClick={toggle}>
          <img className={style.barCode} src={barcode} alt="Barcode" />
        </button>
        <Modal
          isShowing={isShowing}
          hide={toggle}
          onChange={onChange}
          setAmount={setAmount}
        />
      </>
    );
  };

  return useMemo(() => {
    return (
      <div className={style.formControl}>
        <label className={style.label}>
          {label}
          <input
            ref={inputEl}
            type="text"
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
        {showModal ? <ModalButton /> : null}
      </div>
    );
  }, [label, onChange, showModal]);
}

export default Input;
