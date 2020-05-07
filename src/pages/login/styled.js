import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  min-height: 100%;
  display: flex;
  padding: 15px;
`;

export const FormWrapper = styled.div`
  background: #fff;
  padding: 15px;
  border-radius: 10px;
  max-width: 680px;
  width: 100%;
  height: fit-content;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  margin: auto;

  .logo {
    height: 90px;
    width: auto;
    margin: auto;
  }
`;

export const FormControl = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-wrap: wrap;

  & ~ & {
    margin-top: 10px;
  }

  label {
    width: 100%;
    font-size: 16px;
    color: #555;
    line-height: 1.5;
    font-weight: 600;
  }

  input {
    outline: none;
    border: none;
  }

  input[type=text],
  input[type=password],
   .PhoneInput {
    width: 100%;
    color: #333;
    line-height: 1.2;
    font-size: 100%;
    display: block;
    width: 100%;
    background: 0 0;
    height: 60px;
    padding: 0 20px;
    background-color: #f7f7f7;
    border: 1px solid #e6e6e6;
    border-radius: 10px;
  }
`;

export const FromGroup = styled.form`
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  max-width: 400px;

  button[type=submit] {
    padding: 0 20px;
    width: 100%;
    height: 60px;
    background-color: #333;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    line-height: 1.2;
    font-weight: 700;
    border: 0;
    margin-top: 25px;
  }
`;


