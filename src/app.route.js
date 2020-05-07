import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import App from "./App";
import Login from "./pages/login";
import ExportPrivateKey from "./pages/ExportPrivateKey";

function AppRoute() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <App />
        </Route>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/export-private-key">
          <ExportPrivateKey />
        </Route>
      </Switch>
    </Router>
  );
}

export default AppRoute;
