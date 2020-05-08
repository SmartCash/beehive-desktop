import React, {useState, useEffect} from 'react';
import {WalletCard} from "./styled";
import SendForm from "../send/components/sendForm/SendForm";
import {getBalance} from "../../lib/sapi";

function Wallets(props) {
  const [withdraw, setWithdraw] = useState(false);
  const [balance, setBalance] = useState("Loading Balance");

  useEffect(() => {
    getBalance(props.wallet.address)
      .then((res) => setBalance(res.balance))
      .catch((error) => setBalance("Error loading balance"));
  }, [])

  return (
    <WalletCard>
      <p>
        <strong>Address</strong>
        {props.wallet.address}
      </p>
      <p>
        <strong>PrivateKey</strong>
        {props.wallet.privateKey}
      </p>
      <p>
        <strong>Balance</strong>
        {String(balance)}
      </p>
      <button className="btn" onClick={() => setWithdraw(!withdraw)}>Withdraw Funds</button>
      {
        withdraw ?
          (
            <SendForm address={props.wallet.address} balance={balance} privateKey={props.wallet.privateKey}/>
          )
          : null
      }
    </WalletCard>
  )
}


export default Wallets;
