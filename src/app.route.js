import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import HttpsRedirect from './components/RedirectToHttps';
import Send from './pages/send/Send';

function AppRoute() {
    return (
        <HttpsRedirect>
            <Router>
                <Switch>
                    <Route exact path="/">
                        <Send />
                    </Route>
                </Switch>
            </Router>
        </HttpsRedirect>
    );
}

export default AppRoute;
