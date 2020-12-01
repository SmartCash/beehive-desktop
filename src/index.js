import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import './index.css';
import { stopReportingRuntimeErrors } from "react-error-overlay";

if (process.env.NODE_ENV === "development") {
  stopReportingRuntimeErrors();
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
