import React, { useMemo, useRef } from "react";
import style from "./InputAmount.module.css";

function InputAmount({ label, initialValue, onChange }) {
  const inputEl = useRef(initialValue);

  return useMemo(() => {
    const handleOnChange = (e) => {
      if (e.target.validity.valid) {
        onChange(inputEl.current.value);
      } else {
        inputEl.current.value = initialValue ? initialValue : null;
      }
    };
    return (
      <div className={style.formControl}>
        <label className={style.label}>
          {label}
          <input
            ref={inputEl}
            type="text"
            pattern="^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:((\.)\d{0,8})+)?$"
            onInput={(e) => handleOnChange(e)}
          />
        </label>
      </div>
    );
  }, [initialValue, label, onChange]);
}

export default InputAmount;
