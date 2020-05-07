import React from "react";
import { Container, List } from "./styled";

function Login() {
  return (
    <Container>
      <p>Carregou a view</p>
      <List>
        <li>Olá</li>
        <li className="diferentao">Olá</li>
      </List>
    </Container>
  );
}

export default Login;
