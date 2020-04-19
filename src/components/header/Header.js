import React from "react";
import logo from "../../assets/images/logo.png";
import style from "./Header.module.css";

function Header() {
  return (
    <div className={style.root}>
      <img src={logo} className={style.logo} alt="SmartCash" />
    </div>
  );
}

export default Header;
