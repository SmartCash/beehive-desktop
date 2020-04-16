import React from 'react';
import logo from './logo.svg';
import './App.css';

import './lib/sapi'
import { getFee, getUnspent, getUnspentWithAmount,getTransactionHistory,getBalance } from './lib/sapi';

function App() {

  getFee(0.00000001,"SgPMhNeG16Ty6VaPSnAtxNJAQ2JRnhTGaQ").then(res=>{
    console.log(res)
  });

  getUnspentWithAmount("SgPMhNeG16Ty6VaPSnAtxNJAQ2JRnhTGaQ",0).then(res=>{
    console.log(res)
  }).catch(e=>console.log(e[0].code, e[0].message));

  getUnspent("SgPMhNeG16Ty6VaPSnAtxNJAQ2JRnhTGaQ").then(res=>{
    console.log(res)
  }).catch(e=>console.log(e[0].code, e[0].message));

  getBalance("SgPMhNeG16Ty6VaPSnAtxNJAQ2JRnhTGaQ").then(res=>{
    console.log(res)
  });
  getTransactionHistory("SgPMhNeG16Ty6VaPSnAtxNJAQ2JRnhTGaQ").then(res=>{
    console.log(res)
  });
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
