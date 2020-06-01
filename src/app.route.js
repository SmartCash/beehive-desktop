import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Send from "./pages/send/Send";

function AppRoute() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Send />
        </Route>
      </Switch>
    </Router>
  );
}

export default AppRoute;
