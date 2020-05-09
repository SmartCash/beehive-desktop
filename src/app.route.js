import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Send from "./pages/send/Send";
import ExportPrivateKeys from "./pages/export-private-keys/ExportPrivateKeys";

function AppRoute() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Send />
        </Route>
        <Route exact path="/export-private-key">
          <ExportPrivateKeys />
        </Route>
      </Switch>
    </Router>
  );
}

export default AppRoute;
