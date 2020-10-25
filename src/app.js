import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import HttpsRedirect from './components/RedirectToHttps';
import { WalletProvider } from './context/WalletContext';
import Send from './pages/send/Send';
import Receive from './pages/receive/Receive';
import Transactions from './pages/transactions/Transactions';
import Dashboard from './pages/dashboard/dashboard';

function App() {
    return (
        <HttpsRedirect>
            <WalletProvider>
                <Router>
                    <Switch>
                        <Route exact path="/">
                            <Dashboard />
                        </Route>
                        <Route exact path="/send">
                            <Send/>
                        </Route>
                        <Route exact path="/receive">
                            <Receive/>
                        </Route>
                        <Route exact path="/transactions">
                            <Transactions/>
                        </Route>
                    </Switch>
                </Router>
            </WalletProvider>
        </HttpsRedirect>
    );
}

export default App;
