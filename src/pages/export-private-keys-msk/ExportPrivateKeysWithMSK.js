import React, { useEffect } from "react";
import {
  Container,
  FormControl,
  FormWrapper,
  FromGroup,
  ErrorMessage,
  ExportMessage,
  AlertMessage,
} from "./styled";
import { useForm } from "react-hook-form";
import useAxios from "axios-hooks";
import "./PhoneInput.css";
import logo from "../../assets/images/logo.png";
import generatePDF from "./GeneratorPDF";
import Wallets from "./Wallets";

function ExportPrivateKeysWithMSK() {
  const api_url = "https://smarthubapi.herokuapp.com/Export/ExportPrivateKeysWithRecoveryKey";
  const [{ data, loading }, refetch] = useAxios(
    {
      url: api_url,
      method: "POST",
    },
    { manual: true }
  );

  const { register, handleSubmit, control, errors } = useForm({
    defaultValues: {
      username: "",
      recoverykey: "",
      ip: ""
    },
  });

  const onSubmit = (data) => {
    refetch({
      data: data,
    });
  };

  useEffect(() => {
    if (data && data.data) {
      generatePDF(data.data, "SmartCash_PrivateKey");
      window.onbeforeunload = function () {
        return "Are you sure? Did you save your private keys? You can export only once!";
      };
    }
  }, [data]);

  return (
    <Container>
      <FormWrapper>
        <img className="logo" src={logo} alt="SmartCash" />

        <ExportMessage>
          <p>
            <strong>Atenção:</strong>
          </p>
          <ul>
            <li>
              Essa base de dados será desligada e substituída pela carteira
              descentralizada SmartHub;
            </li>
            <li>Você só pode exportar uma vez;</li>
            <li>
              Você deve fazer o download de uma das carteiras abaixo, criar um
              novo endereco e TRANSFERIR os seus fundos:
            </li>
            <ul>
              <li>
                Para Mobile use (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://play.google.com/store/apps/details?id=com.ellipal.wallet"
                >
                  Ellipal
                </a>
                ,{" "}
                <a
                  target="_blank"
                  href="https://play.google.com/store/apps/details?id=com.coinomi.wallet"
                >
                  Coinomi
                </a>
                ,{" "}
                <a
                  target="_blank"
                  href="https://play.google.com/store/apps/details?id=io.atomicwallet"
                >
                  Atomic Wallet
                </a>
                ,{" "}
                <a
                  target="_blank"
                  href="https://play.google.com/store/apps/details?id=co.edgesecure.app"
                >
                  Edge Wallet
                </a>
                ,
                <a
                  target="_blank"
                  href="https://play.google.com/store/apps/details?id=cloud.peer2.pungo_wallet"
                >
                  Pungo Wallet
                </a>
                )
              </li>
              <li>
                Para Desktop use (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://smartcash.cc/wallets/"
                >
                  Electrum Wallet, Node Wallet
                </a>
                )
              </li>
            </ul>
            <li>
              NÃO importe suas chaves privadas para nenhuma outra carteira;
            </li>
            <li>Transfira seus fundos IMEDIATAMENTE!</li>
            <li>
              Reembolsos serão realizados automaticamente por SMS e ou email.
              Não use contas falsas ou não será reembolsado em caso de erro.
            </li>
          </ul>
        </ExportMessage>

        <ExportMessage>
          <p>
            <strong>Attention:</strong>
          </p>
          <ul>
            <li>
              The database for this wallet will be shutting down and will be
              replaced with the decentralized SmartHub.;
            </li>
            <li>
              Download one of these wallets, create a new receive address, and
              withdraw to it:
            </li>
            <ul>
              <li>
                Mobile use (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://play.google.com/store/apps/details?id=com.ellipal.wallet"
                >
                  Ellipal
                </a>
                ,{" "}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://play.google.com/store/apps/details?id=com.coinomi.wallet"
                >
                  Coinomi
                </a>
                ,{" "}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://play.google.com/store/apps/details?id=io.atomicwallet"
                >
                  Atomic Wallet
                </a>
                ,{" "}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://play.google.com/store/apps/details?id=co.edgesecure.app"
                >
                  Edge Wallet
                </a>
                ,
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://play.google.com/store/apps/details?id=cloud.peer2.pungo_wallet"
                >
                  Pungo Wallet
                </a>
                )
              </li>
              <li>
                Desktop use (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://smartcash.cc/wallets/"
                >
                  Electrum Wallet, Node Wallet
                </a>
                )
              </li>
            </ul>
            <li>
              Or you can export private keys into another wallet and send to a
              new address.
            </li>
            <li>This export process can only be done once;</li>
            <li>DO NOT leave funds in these private keys.;</li>
            <li>
              Reimbursements will be automatically paid via SMS and Email, so
              don't fake it or you will not be reimbursed.
            </li>
          </ul>
        </ExportMessage>
        {!data?.data ? (
          <FromGroup onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <FormControl>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                ref={register({ required: "Required" })}
              />
            </FormControl>

            <FormControl>
              <label htmlFor="recoverykey">Master Security Code</label>
              <input
                type="text"
                name="recoverykey"
                ref={register({ required: "Required" })}
              />
            </FormControl>

            {loading ? <p>Loading</p> : null}
            {data?.error ? (
              <ErrorMessage>Error: {data?.message}</ErrorMessage>
            ) : null}

            <button type="submit">Export Private Key</button>
          </FromGroup>
        ) : null}
        {data?.data && data?.message ? (
          <AlertMessage>{data?.message}</AlertMessage>
        ) : null}
        {data?.data ? (
          <>
            <div className="buttonsWrapper">
              <button
                className="btn"
                onClick={() => generatePDF(data?.data, "SmartCash_PrivateKey")}
              >
                Save Private Key to PDF
              </button>
            </div>
          </>
        ) : null}
        {data?.data
          ? data?.data.map((wallet, index) => {
              return <Wallets wallet={wallet} key={index} />;
            })
          : null}
      </FormWrapper>
    </Container>
  );
}

export default ExportPrivateKeysWithMSK;
