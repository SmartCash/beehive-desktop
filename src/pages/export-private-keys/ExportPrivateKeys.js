import React, {useEffect} from "react";
import {
  Container,
  FormControl,
  FormWrapper,
  FromGroup,
  ErrorMessage, ExportMessage, AlertMessage
} from "./styled";
import {useForm, Controller} from "react-hook-form";
import useAxios from 'axios-hooks';
import PhoneInput from 'react-phone-number-input'
import './PhoneInput.css';
import logo from "../../assets/images/logo.png";
import generatePDF from './GeneratorPDF';
import Wallets from "./Wallets";

function ExportPrivateKeys() {
  const api_url = 'https://smarthubapi.herokuapp.com/Export/ExportPrivateKeys';
  const [{data, loading}, refetch] = useAxios({
    url: api_url,
    method: 'POST'
  }, {manual: true});

  const {register, handleSubmit, control, errors} = useForm({
    defaultValues: {
      "username":"",
      "password":"",
      "email":"",
      "twoFactorCode":"",
      "phone":""
    }
  });

  const onSubmit = (data) => {
    refetch(
      {
        data: data,
      }
    );
  }

  useEffect(() => {
    if (data && data.data) {
      generatePDF(data.data, 'SmartCash_PrivateKey');
      window.onbeforeunload = function() { return "Are you sure? Did you save your private keys? You can export only once!"; }
    }
  }, [data]);

  return (
    <Container>
      <FormWrapper>

        <img className="logo" src={logo} alt="SmartCash"/>


        <ExportMessage>
          <p><strong>Atenção:</strong></p>
          <ul>
            <li>Exporte sua CHAVE PRIVADA até 30 de maio de 2020;</li>
            <li>Você só pode exportar uma vez;</li>
            <li>Você deve criar uma carteira nova e TRANSFERIR os seus fundos:</li>
            <ul>
              <li>Para Mobile use (<a target="_blank" href="https://play.google.com/store/apps/details?id=com.ellipal.wallet">Ellipal</a>, <a target="_blank"  href="https://play.google.com/store/apps/details?id=com.coinomi.wallet">Coinomi</a>, <a target="_blank"  href="https://play.google.com/store/apps/details?id=io.atomicwallet">Atomic Wallet</a>, <a target="_blank"  href="https://play.google.com/store/apps/details?id=co.edgesecure.app">Edge Wallet</a>,<a target="_blank"  href="https://play.google.com/store/apps/details?id=cloud.peer2.pungo_wallet">Pungo Wallet</a>)</li>
              <li>Para Desktop use (<a target="_blank"  href="https://smartcash.cc/wallets/">Electrum Wallet, Node Wallet</a>)</li>
            </ul>
            <li>NÃO importe suas chaves privadas para nenhuma outra carteira;</li>
            <li>Transfira seus fundos IMEDIATAMENTE!</li>
          </ul>

        </ExportMessage>

        <ExportMessage>
          <p><strong>Attention:</strong></p>
              <ul>
            <li>The database for this wallet will be shutting down and will be replaced with the decentralized SmartHub.;</li>
            <li>Please remove funds before May 30, 2020, when this wallet will be deactivated;</li>
            <li>Download one of these wallets, create a new receive address, and withdraw to it:</li>
            <ul>
              <li>Mobile use (<a href="https://play.google.com/store/apps/details?id=com.ellipal.wallet">Ellipal</a>, <a href="https://play.google.com/store/apps/details?id=com.coinomi.wallet">Coinomi</a>, <a href="https://play.google.com/store/apps/details?id=io.atomicwallet">Atomic Wallet</a>, <a href="https://play.google.com/store/apps/details?id=co.edgesecure.app">Edge Wallet</a>,<a href="https://play.google.com/store/apps/details?id=cloud.peer2.pungo_wallet">Pungo Wallet</a>)</li>
              <li>Desktop use (<a href="https://smartcash.cc/wallets/">Electrum Wallet, Node Wallet</a>)</li>
            </ul>
           <li>Or you can export private keys into another wallet and send to a new address.</li>  
            <li>This export process can only be done once;</li>
            <li>DO NOT leave funds in these private keys.;</li>
          </ul>

        </ExportMessage>
        {
          (!data?.data) ?
            (
              <FromGroup onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                <FormControl>
                  <label htmlFor="username">Username</label>
                  <input type="text" name="username" ref={register({required: "Required"})}/>
                </FormControl>

                <FormControl>
                  <label htmlFor="password">Password</label>
                  <input type="password" name="password" ref={register({required: "Required"})}/>
                </FormControl>

                <FormControl>
                  <label htmlFor="email">Email</label>
                  <input type="text" name="email" ref={register({required: "Required"})}/>
                </FormControl>

                <FormControl>
                  <label htmlFor="phone">Phone</label>
                  <Controller
                    as={PhoneInput}
                    control={control}
                    name="phone"
                    className="phoneinput-wrapper"
                    autoComplete="off"
                    ref={register}
                  />
                </FormControl>

                <FormControl>
                  <label htmlFor="twoFactorCode">TWO Factor Code</label>
                  <input type="text" name="twoFactorCode" ref={register}/>
                </FormControl>

                {
                  loading ?
                    (
                      <p>Loading</p>
                    )
                    : null
                }
                {
                  data?.error ?
                    (
                      <ErrorMessage>
                        Error: {data?.message}
                      </ErrorMessage>
                    )
                  : null
                }

                <button type="submit">Export Private Key</button>

              </FromGroup>
            )
          : null
        }
        {
          data?.data && data?.message ?
            (
              <AlertMessage>{data?.message}</AlertMessage>
            )
            : null
        }
        {
          data?.data ?
            (
              <>
                <div className="buttonsWrapper">
                  <button className="btn" onClick={() => generatePDF(data?.data, 'SmartCash_PrivateKey')}>Save Private Key to PDF</button>
                </div>
              </>
            )
            : null
        }
        {
          data?.data ?
            data?.data.map((wallet, index) => {
              return (<Wallets wallet={wallet} key={index}/>)
            })
          : null
        }
      </FormWrapper>
    </Container>
  );
}

export default ExportPrivateKeys;
