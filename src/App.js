import React from "react";
import {
  getBalance,
  getFee,
  getTransactionHistory,
  getUnspent,
  getUnspentWithAmount,
} from "./lib/sapi";
import Send from "./send/Send";

function App() {
  getFee(0.00000001, "SgPMhNeG16Ty6VaPSnAtxNJAQ2JRnhTGaQ").then((res) => {
    console.log(res);
  });

  getUnspentWithAmount("SgPMhNeG16Ty6VaPSnAtxNJAQ2JRnhTGaQ", 0)
    .then((res) => {
      console.log(res);
    })
    .catch((e) => console.log(e[0].code, e[0].message));

  getUnspent("SgPMhNeG16Ty6VaPSnAtxNJAQ2JRnhTGaQ")
    .then((res) => {
      console.log(res);
    })
    .catch((e) => console.log(e[0].code, e[0].message));

  getBalance("SgPMhNeG16Ty6VaPSnAtxNJAQ2JRnhTGaQ").then((res) => {
    console.log(res);
  });
  getTransactionHistory("SgPMhNeG16Ty6VaPSnAtxNJAQ2JRnhTGaQ").then((res) => {
    console.log(res);
  });

  return (
    <>
      {/* <Header /> */}
      <Send />
    </>
  );
}

export default App;
