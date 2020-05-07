import React from "react";
import {Container, FormControl, FormWrapper, FromGroup} from "./styled";
import {useForm, Controller} from "react-hook-form";
import useAxios from 'axios-hooks';
import PhoneInput from 'react-phone-number-input'
import './PhoneInput.css';
import logo from "../../assets/images/logo.png";

function Login() {
  const api_url = '';
  const [{data, loading, error}, refetch] = useAxios({
    url: api_url,
    method: 'POST'
  }, {manual: true});

  const {register, handleSubmit, control} = useForm();

  const onSubmit = (data) => {
    console.log(data)
    refetch({data});
  }

  return (
    <Container>
      <FormWrapper>

        <img className="logo" src={logo} alt="SmartCash"/>

        {
          !loading ? (
            <>
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

                <button type="submit">Login</button>
              </FromGroup>
            </>
          ) : <p>Loading</p>
        }

      </FormWrapper>
    </Container>
  );
}

export default Login;
