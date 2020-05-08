import React, {useEffect} from "react";
import {
  Container,
  FormControl,
  FormWrapper,
  FromGroup,
  ErrorMessage, ExportMessage
} from "./styled";
import {useForm, Controller} from "react-hook-form";
import useAxios from 'axios-hooks';
import PhoneInput from 'react-phone-number-input'
import './PhoneInput.css';
import logo from "../../assets/images/logo.png";
import generatePDF from './GeneratorPDF';
import Wallets from "./Wallets";
import {createNewWalletKeyPair} from "../../lib/sapi";

function ExportPrivateKeys() {
  const api_url = 'https://smarthubapi.herokuapp.com/Export/ExportPrivateKeys';
  const [{data, loading}, refetch] = useAxios({
    url: api_url,
    method: 'POST'
  }, {manual: true});

  const {register, handleSubmit, control} = useForm({
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
    }
  }, [data]);

  return (
    <Container>
      <FormWrapper>
        <img className="logo" src={logo} alt="SmartCash"/>
        {
          (!data?.data) ?
            (
              <FromGroup onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                <FormControl>
                  <label htmlFor="username">Username</label>
                  <input type="text" name="username" ref={register}/>
                </FormControl>

                <FormControl>
                  <label htmlFor="password">Password</label>
                  <input type="password" name="password" ref={register}/>
                </FormControl>

                <FormControl>
                  <label htmlFor="email">Email</label>
                  <input type="text" name="email" ref={register}/>
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

                <ExportMessage>You can export your private key just once! Save it to a pdf file</ExportMessage>
              </FromGroup>
            )
          : null
        }
        {
          data?.data ?
            (
              <>
                <ExportMessage>You can export your private key just once! Save it to a pdf file</ExportMessage>
                <div className="buttonsWrapper">
                  <button className="btn" onClick={() => generatePDF(data?.data, 'SmartCash_PrivateKey')}>Save Private Keys to PDF</button>
                  <button className="btn" onClick={() => generatePDF([createNewWalletKeyPair()], 'SmartCash_Address')}>Generate new address</button>
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
