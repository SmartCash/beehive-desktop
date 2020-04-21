import React, { useMemo, useState } from "react";
import style from "./InputAmount.module.css";

function InputAmount({ label, value, onChange }) {
  const [localValue, setlocalValue] = useState();

  return useMemo(() => {
    const handleInput = (e) => {
      if (e.target.validity.valid) {
        onChange(e.target.value);
        setlocalValue(e.target.value);
      } else {
        onChange(localValue);
      }
    };
    return (
      <div className={style.formControl}>
        <label className={style.label}>
          {label}
          <input
            type="text"
            pattern="^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:((\.)\d{0,8})+)?$"
            value={localValue}
            onKeyUp={handleInput}
          />
        </label>
      </div>
    );
  }, [label, localValue, onChange]);
}

export default InputAmount;
