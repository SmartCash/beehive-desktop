import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import HttpsRedirect from './presentation/components/RedirectToHttps';
import { WalletProvider } from './application/context/WalletContext';
import { Send } from './presentation/pages/send/Send';
import Receive from './presentation/pages/receive/Receive';
import Transactions from './presentation/pages/transactions/Transactions';
import { Chat } from './presentation/pages/chat/Chat';
import { RewardsActivate } from './presentation/pages/rewards/activate';
import ProtectedRoute from './presentation/components/ProtectedRoute';

function App() {
    return (
        <HttpsRedirect>
            <WalletProvider>
                <ProtectedRoute>
                    <Router>
                        <Switch>
                            <Route exact path="/">
                                <Send />
                            </Route>
                            <Route exact path="/receive">
                                <Receive />
                            </Route>
                            <Route exact path="/transactions">
                                <Transactions />
                            </Route>
                            <Route exact path="/chat">
                                <Chat />
                            </Route>
                            <Route exact path="/rewards">
                                <RewardsActivate />
                            </Route>
                        </Switch>
                    </Router>
                </ProtectedRoute>
            </WalletProvider>
        </HttpsRedirect>
    );
}

export default App;
