import React from 'react';
import ProtectedRoute from 'presentation/components/ProtectedRoute';
import { Chat } from 'presentation/pages/chat/Chat';
import Receive from 'presentation/pages/receive/Receive';
import { RewardsActivate } from 'presentation/pages/rewards/activate';
import { Send } from 'presentation/pages/send/Send';
import Transactions from 'presentation/pages/transactions/Transactions';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { WalletsExport } from 'presentation/pages/wallets-export/wallets-export';

export function Routes() {
    return (
        <ProtectedRoute>
            <Router>
                <Switch>
                    <Route exact path='/'>
                        <Send />
                    </Route>
                    <Route exact path='/receive'>
                        <Receive />
                    </Route>
                    <Route exact path='/transactions'>
                        <Transactions />
                    </Route>
                    <Route exact path='/chat'>
                        <Chat />
                    </Route>
                    <Route exact path='/rewards'>
                        <RewardsActivate />
                    </Route>
                    <Route exact path='/wallets/export'>
                        <WalletsExport />
                    </Route>
                </Switch>
            </Router>
        </ProtectedRoute>
    );
}
