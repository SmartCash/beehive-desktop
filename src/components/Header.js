import React from 'react';
import { ReactComponent as Logo } from '../assets/images/logo.svg';
import { NavLink } from 'react-router-dom';

function Header() {
    return (
        <div className="header">
            <div>
                <Logo className="logo" />
            </div>
            <div className="nav">
                <ul>
                    <li>
                        <NavLink exact to="/">
                            Send
                        </NavLink>
                    </li>
                    <li>
                        <NavLink exact to="/receive">
                            Receive
                        </NavLink>
                    </li>
                    <li>
                        <NavLink exact to="/transactions">
                            Transactions
                        </NavLink>
                    </li>
                    <li>
                        <NavLink exact to="/chat">
                            Chat
                        </NavLink>
                    </li>
                    <li>
                        <NavLink exact to="/rewards">
                            Rewards
                        </NavLink>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Header;
