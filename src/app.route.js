import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import Send from "./pages/send/Send";
import ExportPrivateKeys from "./pages/export-private-keys/ExportPrivateKeys";
import ExportPrivateKeysWithMSK from "./pages/export-private-keys-msk/ExportPrivateKeysWithMSK";

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
        <Route exact path="/export-private-key-msk">
          <ExportPrivateKeysWithMSK />
        </Route>
      </Switch>
    </Router>
  );
}

export default AppRoute;
